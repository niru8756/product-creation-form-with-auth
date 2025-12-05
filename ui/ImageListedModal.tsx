/* eslint-disable */
// @ts-nocheck
import { Button } from "@/ui/Button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import DraggedImage from "@/ui/DraggedImage";
import {
  AssetPayloadType,
  AssetType,
  CreateAssetType,
  DataFileType,
  UpdateAssetType,
} from "@/types/productTypes";
import { useEffect, useState } from "react";
import DeleteAsset from "./DeleteAsset";
import ImageUploadSection from "@/component/ImageUploadSection";
import { useMutation, useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/axios";
import { getStoreId, getToken } from "@/lib/cookies";
import { RowAssetsMapType } from "./PublishChannelDataGrid";
import { set } from "date-fns";
import { errorToast, successToast } from "./Toast";
import { AxiosError } from "axios";

const storeId = getStoreId();
interface ImageListedModalProps {
  data: DataFileType[];
  setData: React.Dispatch<React.SetStateAction<DataFileType[]>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleOpen: () => void;
  setAssets?: React.Dispatch<React.SetStateAction<DataFileType[]>>;
  assets?: DataFileType[];
  setProductAssets?: (val: AssetType[]) => void;
  selectedRowId?: number;
  setRowAssetsMap?: React.Dispatch<React.SetStateAction<RowAssetsMapType>>;
}

function ImageListedModal({
  data,
  setData,
  onChange,
  toggleOpen,
  setAssets,
  assets,
  selectedRowId,
  setProductAssets,
  setRowAssetsMap,
}: ImageListedModalProps) {
  const productId = null;
  const [prevData] = useState<AssetPayloadType[]>([]);
  const accessToken = getToken();
  const storeId = getStoreId();
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const [isSaveDisable, setIsSaveDisable] = useState<boolean>(false);
  const [backImageId, setBackImageId] = useState<number | null>(null);
  const [backImageSetnewId, setBackImageSetnewId] = useState<boolean>(false);
  const [rowAssetLists, setRowAssetLists] = useState<Record<number, string[]>>(
    {},
  );
  const [assetsList, setAssetsList] = useState<string[]>([]);
  // ======================================================================

  useEffect(() => {
    if (assets && assets.length > 0) {
      // Extract all asset IDs
      const assetIds = assets.map((asset) => asset.id.toString());

      // Initialize general assets list
      setAssetsList(assetIds);

      // If we have a selectedRowId, also initialize the row-specific list
      if (selectedRowId !== undefined) {
        setRowAssetLists((prev) => ({
          ...prev,
          [selectedRowId]: assetIds,
        }));
      }
    }
  }, []);

  useEffect(() => {
    if (selectedRowId && assets && assets.length > 0) {
      // Initialize rowAssetLists with current row's asset IDs
      setRowAssetLists((prevState) => ({
        ...prevState,
        [selectedRowId]: assets.map((asset) => asset.id.toString()),
      }));
    }
  }, [selectedRowId, assets]);

  useEffect(() => {
    if (data?.length > 0 && backImageId) {
      const backImageItem = data.find(
        (item) => item.id.toString() === backImageId.toString(),
      );
      const lastItem = data[data.length - 1];

      // Only reorder if back image exists and it's not already at the end
      if (backImageItem && lastItem && backImageItem.id !== lastItem.id) {
        const filteredData = data.filter(
          (item) => item.id.toString() !== backImageId.toString(),
        );

        setData([...filteredData, backImageItem]);
      }
    }
  }, [backImageId]); // Only depend on backImageId, not data

  // Effect for handling new back image setting
  useEffect(() => {
    if (backImageSetnewId && data.length > 0) {
      const backImage = data[data.length - 1];
      if (backImage?.id !== backImageId) {
        setBackImageId(backImage?.id);
        setIsSaveDisable(true);
      }
      setBackImageSetnewId(false); // Reset the flag after handling
    }
  }, [backImageSetnewId, data.length]);

  useEffect(() => {
    if (backImageSetnewId) {
      const backImage = data[data.length - 1];
      setBackImageId(backImage?.id);
      setIsSaveDisable(true);
    }
  }, [backImageSetnewId]);

  useEffect(() => {
    if (assets && assets.length > 0) {
      setAssetsList((prevList) => {
        const newIds = assets.map((asset) => asset.id.toString());
        // Combine existing and new IDs, removing duplicates
        return [...new Set([...prevList, ...newIds])];
      });
    }
  }, [assets]);

  const getDataPos = (id: UniqueIdentifier) =>
    data.findIndex((datapos) => datapos.id === id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    if (active.id === backImageId) return;
    const overIndex = getDataPos(over.id);
    if (data[overIndex].id === backImageId) return;

    setData((data) => {
      const originalPos = getDataPos(active.id);
      const newPos = getDataPos(over.id);

      const newData = arrayMove(data, originalPos, newPos);

      if (backImageId) {
        const backImageIndex = newData.findIndex(
          (item) => item.id === backImageId,
        );
        if (backImageIndex !== newData.length - 1) {
          const [backImage] = newData.splice(backImageIndex, 1);
          newData.push(backImage);
        }
      }

      return newData;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
  );

  const imageSelectHandle = (num: string) => {
    const position = num;
    setSelectedAssets((prev) => {
      if (prev.includes(position)) {
        return prev.filter((id) => id !== position);
      } else {
        return [...prev, position];
      }
    });
  };

  // assets api integrations

  // ===================================== get assets urls ==============================

  const assetsUrlsListMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await productApi.post("/asset/all", payload, {
        headers: {
          "x-store-id": storeId,
        },
      });
      return data.data;
    },
  });

  //  create assets api
  const { mutateAsync: createAsset } = useMutation({
    mutationFn: async (payload: CreateAssetType) => {
      const res = await productApi.post(`/asset`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      successToast(data.message || "Assets created successfully");
      // const assetIdsList = data.map((assetId) => {
      //   return assetId.id;
      // });      // const assetDataObj = {
      //   assetIds: assetIdsList,
      // };
      // assetsUrlsListMutation.mutate(assetDataObj);
      setSelectedAssets([]);
      setIsSaveDisable(false);

      // if (setRowAssetsMap) {
      //   setRowAssetsMap((prev) => ({
      //     ...prev,
      //     [selectedRowId as number]: {
      //       ...prev[selectedRowId as number],
      //       assetData: prev[selectedRowId as number]?.assetData || [],
      //       // assets: data,
      //     },
      //   }));
      // }

      // if (setProductAssets) {
      //   setProductAssets(data);
      // }
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response) {
        errorToast(error.response.data.message);
      } else {
        errorToast("Something went wrong");
      }
    },
  });

  //update assets api
  const { mutate: updateAsset } = useMutation({
    mutationFn: async (payload: UpdateAssetType) => {
      const res = await productApi.patch(`/asset`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      successToast(data.message);
      return data;
      // successToast("User deleted successfully", "");
      // closeOpen();
      // queryClient.invalidateQueries({ queryKey: ["memberList"] });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response) {
        errorToast(error.response.data.message);
      } else {
        errorToast("Something went wrong");
      }
    },
  });

  // Delete assets api
  const { mutate: deleteAsset } = useMutation({
    mutationFn: async (payload: UpdateAssetType) => {
      const res = await productApi.delete(`/asset`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        data: payload,
      });
      return res.data;
    },
    onSuccess: (data) => {
      successToast(data.message);
      return data;
      // closeOpen();
      // queryClient.invalidateQueries({ queryKey: ["memberList"] });
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError && error.response) {
        errorToast(error.response.data.message);
      } else {
        errorToast("Something went wrong");
      }
    },
  });
  // assets;
  async function uploadFileToSignedUrl(file: File, signedUrl: string) {
    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type, // Ensure correct file type
      },
      body: file, // Send the file as the body
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${file.name}: ${response.statusText}`);
    }

    return { success: true, fileName: file.name, url: signedUrl };
  }

  type uploadMutationType = {
    file: File;
    signedUrl: string;
  };
  const uploadMutation = useMutation({
    mutationFn: async ({ file, signedUrl }: uploadMutationType) => {
      const response = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to upload ${file.name}: ${response.statusText}`,
        );
      }

      return { success: true, fileName: file.name, url: signedUrl };
    },
    retry: 3,
  });

  // Delete selected assets
  const handleDelete = async () => {
    try {
      if (selectedAssets.length === 0) return;

      // Convert all to strings for consistent comparison and API requirements
      const selectedAssetsAsStrings = selectedAssets.map(String);

      // 1. Optimistic local update first
      const newData = data.filter(
        (asset) => !selectedAssetsAsStrings.includes(String(asset.id)),
      );

      setData(newData);
      if (setAssets) {
        setAssets(newData);
      }
      setSelectedAssets([]);

       // Also update product assets if provided
    if (setProductAssets) {
      setProductAssets(newData);
    }

      // 2. Prepare API payload (using string IDs as required by API)
      const deletePayload = {
        assetIds: selectedAssetsAsStrings, // Now sending strings
      };

      // console.log("Delete payload:", deletePayload); // Debugging

      // 3. Call API
      await deleteAsset(deletePayload);

      // ... rest of your state updates remain the same ...
    } catch (error) {
      console.error("Delete error:", error);
      // Revert on error
      if (assets) setData([...assets]);
      errorToast("Failed to delete assets");
    }
  };
  const onDelete = handleDelete;

  //  save handler with sequential flow
  const saveHandle = async () => {
    const shouldEnableSaveButton = data.length > 2 && backImageId !== null;
    if (!shouldEnableSaveButton) return;
  
    try {
      setIsSaveDisable(true);
  
      // 1. First, preserve the current order of all assets (both row-specific and general)
      const currentOrder = data.map(item => item.id.toString());
  
      // 2. Handle new files (files needing upload)
      const filterData = data
        .filter((item): item is Omit<DataFileType, "file"> & { file: File } => {
          return item.file !== undefined && item.file !== null;
        })
        .map((item, index) => ({
          fileName: item.file.name,
          fileType: item.fileType,
          mimeType: item.file.type,
          fileSize: item.file.size,
          position: index + 1,
          file: item.file,
        }));
  
      let finalUrlsData = [...data];
      let currentAssetIds = selectedRowId
        ? rowAssetLists[selectedRowId] || []
        : assetsList;
  
      // 3. If we have new files, upload them
      if (filterData.length > 0) {
        const payload: CreateAssetType = { assets: filterData };
        const assetData = (await createAsset(payload)) as AssetType[];
  
        // Upload files
        const uploadPromises = filterData.map(async (item, index) => {
          const signedUrl = assetData[index].signedUrl;
          await uploadMutation.mutateAsync({
            file: item.file,
            signedUrl: signedUrl,
          });
          return assetData[index].id.toString();
        });
  
        const newAssetIds = await Promise.all(uploadPromises);
  
        // Update the appropriate asset list with new IDs IN THE CORRECT ORDER
        if (selectedRowId) {
          // For row assets: merge new assets while preserving order
          const updatedRowAssets = [
            ...currentOrder.filter(id => 
              !newAssetIds.includes(id) && 
              (rowAssetLists[selectedRowId] || []).includes(id)
            ),
            ...newAssetIds
          ];
          
          setRowAssetLists(prev => ({
            ...prev,
            [selectedRowId]: updatedRowAssets,
          }));
          currentAssetIds = updatedRowAssets;
        } else {
          // For general assets: merge new assets while preserving order
          const updatedAssetsList = [
            ...currentOrder.filter(id => 
              !newAssetIds.includes(id) && 
              assetsList.includes(id)
            ),
            ...newAssetIds
          ];
          
          setAssetsList(updatedAssetsList);
          currentAssetIds = updatedAssetsList;
        }
      } else {
        // If no new files, just use the current order
        if (selectedRowId) {
          setRowAssetLists(prev => ({
            ...prev,
            [selectedRowId]: currentOrder,
          }));
        } else {
          setAssetsList(currentOrder);
        }
        currentAssetIds = currentOrder;
      }
  
      // 4. Fetch URLs for all assets (existing + new)
      if (currentAssetIds.length > 0) {
        const urlsData = await assetsUrlsListMutation.mutateAsync({
          assetIds: currentAssetIds,
        });
        finalUrlsData = urlsData;
  
        // Reorder the fetched data to match our currentOrder
        finalUrlsData.sort((a, b) => 
          currentOrder.indexOf(a.id.toString()) - 
          currentOrder.indexOf(b.id.toString())
        );
      }
  
      // 5. Handle back image placement
      if (backImageId) {
        const backImageItem = finalUrlsData.find(
          item => item.id.toString() === backImageId.toString()
        );
        if (backImageItem) {
          finalUrlsData = [
            ...finalUrlsData.filter(
              item => item.id.toString() !== backImageId.toString()
            ),
            backImageItem,
          ];
        }
      }
  
      // 6. Update all relevant states
      if (setRowAssetsMap && selectedRowId) {
        setRowAssetsMap(prev => ({
          ...prev,
          [selectedRowId]: {
            assetData: finalUrlsData,
            assets: finalUrlsData.map(asset => ({
              id: asset.id.toString(),
              src: asset.assetUrl,
              type: asset.fileType,
            })),
          },
        }));
      }
  
      if (setAssets) setAssets(finalUrlsData);
      if (setData) setData(finalUrlsData);
      if (setProductAssets) setProductAssets(finalUrlsData);
  
      // 7. Clean up and close
      setSelectedAssets([]);
      setBackImageSetnewId(true);
      toggleOpen();
    } catch (error) {
      setIsSaveDisable(false);
      console.error("Save error:", error);
      errorToast("Failed to save changes");
    }
  };
  // discard assets
  // Modified cancel handler to properly clean up blob URLs
  const cancleHandle = () => {
    // 1. If we have original assets, restore them
    if (assets) {
      // Filter out any assets with blob URLs
      const cleanAssets = assets.filter(
        (asset) => !asset.assetUrl || !asset.assetUrl.startsWith("blob:"),
      );

      // Reset data to original clean assets
      setData(cleanAssets);

      // Also update external state if setAssets is provided
      if (setAssets) {
        setAssets(cleanAssets);
      }

      // Update the row assets map if needed
      if (setRowAssetsMap && selectedRowId !== undefined) {
        setRowAssetsMap((prevMap) => {
          // Create a deep copy to avoid mutation
          const newMap = { ...prevMap };

          // Get the current row's assets
          const currentRow = newMap[selectedRowId];

          if (currentRow) {
            // Filter out blob URLs from assets array
            const cleanedAssets = currentRow.assets.filter(
              (asset) => !asset.src || !asset.src.startsWith("blob:"),
            );

            // Filter out blob URLs from assetData array
            const cleanedAssetData = currentRow.assetData.filter(
              (asset) => !asset.assetUrl || !asset.assetUrl.startsWith("blob:"),
            );

            // Update the row with cleaned assets
            newMap[selectedRowId] = {
              assets: cleanedAssets,
              assetData: cleanedAssetData,
            };
          }

          return newMap;
        });
      }
    } else {
      // If no original assets, clear everything
      setData([]);
      if (setAssets) {
        setAssets([]);
      }

      if (setRowAssetsMap && selectedRowId !== undefined) {
        setRowAssetsMap((prevMap) => ({
          ...prevMap,
          [selectedRowId]: {
            assets: [],
            assetData: [],
          },
        }));
      }
    }

    // Reset selection state
    setSelectedAssets([]);

    // Close the modal
    toggleOpen();
  };

  // back image handle
  const backImageHandle = () => {
    const selectedId = selectedAssets[0];

    const selectedItemIndex = data.findIndex(
      (d) => d.id.toString() === selectedId,
    );

    if (selectedItemIndex !== -1) {
      const newData = [...data];

      const [selectedItem] = newData.splice(selectedItemIndex, 1);

      newData.push(selectedItem);
      setData(newData);
      setBackImageId(selectedId);
      setSelectedAssets([]);
    }
  };

  useEffect(() => {
    const shouldEnableSaveButton = data.length > 2 && backImageId !== null;

    setIsSaveDisable(shouldEnableSaveButton);
  }, [data, backImageId]);

  

  return (
    <DialogContent
      onInteractOutside={() => cancleHandle()}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
      }}
      hidecross="true"
      className="lg:min-w-[1006px] min-w-full p-6 gap-8 flex flex-col h-fit"
    >
      {/* <DialogClose
        className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        onClick={() => {
          cancleHandle();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span className="sr-only">Close</span>
      </DialogClose> */}
      <DialogHeader className="text-left">
        <div className="flex md:flex-row flex-col items-center gap-2">
          <DialogTitle className="text-Gray-950 text-[20px] leading-[30px] font-semibold">
            {`Product Images `}
          </DialogTitle>
          <p className="text-Gray-500 text-sm font-normal">
            {" "}
            (Minimum 3 images are required)
          </p>
        </div>
        <DialogDescription className="text-Gray-500 md:text-sm text-xs font-normal">
          Upload product images that highlight the key features and details of
          your item.
        </DialogDescription>
      </DialogHeader>
      <div className="w-full flex flex-col gap-8 lg:max-h-[470px] max-h-96 md:pe-8 overflow-auto scrollStyle">
        <ImageUploadSection id={"dropzone-file3"} onChange={onChange} />
        <div className="flex items-center gap-2">
          <DeleteAsset
            onDelete={onDelete}
            heading={"Delete Product Images?"}
            description={
              "Are you sure you want to delete the selected product images?"
            }
          >
            <button
              disabled={selectedAssets.length == 0}
              className="bg-Error-600 shadow-shadow-xs border-brand-600-orange-p-1 rounded-lg py-2 px-3 text-white text-sm font-semibold hover:bg-Error-700 transition-all duration-300 ease-in-out disabled:bg-Gray-100 disabled:text-Gray-400 disabled:border-Gray-200"
            >
              Delete
            </button>
          </DeleteAsset>
          <button
            disabled={selectedAssets.length != 1}
            type="button"
            className="border border-Brand-300 bg-Brand-50 shadow-shadow-xs px-3 py-2 flex justify-center items-center rounded-lg font-semibold text-sm disabled:bg-Gray-100 disabled:text-Gray-400 disabled:border-Gray-200 text-Brand-700"
            onClick={backImageHandle}
          >
            Mark as back Image
          </button>
        </div>
        <DndContext
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <div className="grid lg:grid-cols-6 grid-cols-4 gap-x-2 gap-y-8">
            <SortableContext items={data} strategy={rectSortingStrategy}>
              {data?.map((image) => {
                return (
                  <DraggedImage
                    id={image.id.toString()}
                    image={image.assetUrl}
                    key={image.id.toString()}
                    fileType={image.fileType}
                    imageSelectHandle={imageSelectHandle}
                    checked={selectedAssets.includes(image.id.toString())}
                    backImageId={backImageId as number}
                  />
                );
              })}
            </SortableContext>
          </div>
        </DndContext>
      </div> 
      <DialogFooter className="sm:justify-start flex-row gap-2">
        <Button
          onClick={cancleHandle}
          type="button"
          className="w-44 px-4 py-2.5 rounded-lg bg-white text-Gray-500 text-[16px] hover:text-Gray-800 border transition-all duration-300 ease-in-out border-Gray-300 hover:bg-transparent shadow-xs focus:text-Gray-800 focus:shadow-ring-gray-shadow-xs"
        >
          Cancel
        </Button>
        <Button
          disabled={!isSaveDisable}
          onClick={saveHandle}
          type="button"
          className="w-44 px-4 py-2.5 rounded-lg bg-brand-600-orange-p-1 text-white text-[16px] border border-Gray-300 hover:bg-Brand-700 shadow-xs transition-all duration-300 ease-in-out focus:shadow-ring-brand-shadow-xs disabled:bg-Gray-200 disabled:text-Gray-500 disabled:border-Gray-300"
        >
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default ImageListedModal;
