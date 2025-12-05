import PlayIcon from "@/assets/images/play-icon.svg";
import { cn } from "@/lib/utils";
import { useProductStore } from "@/store/ProductStore";
import { DataFileType } from "@/type/product-type";
import { useEffect, useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ImageListedModal from "./ImageListedModal";
import ImageUploadSection from "@/component/ImageUploadSection";
import { errorToast } from "./Toast";
import Image from "next/image";

interface ImageListProps {
  assets: DataFileType[];
  setAssets: React.Dispatch<React.SetStateAction<DataFileType[]>>;
}
interface DisplayImageProps {
  imageData: DataFileType;
  size?: "small" | "large";
}

const DisplayImage = ({ imageData, size }: DisplayImageProps) => {
  if (!imageData?.assetUrl) {
    return (
      <div className="bg-gray-200 rounded-lg w-full h-full">No image URL</div>
    );
  }

  const mimeType = imageData?.metadata?.mimeType || imageData?.fileType;
  const isImage =
    mimeType?.includes("image") || imageData?.fileType === "IMAGE";

  return isImage ? (
    <div
      className={cn(
        "relative rounded-lg w-full overflow-hidden",
        size === "small" ? "h-[86px]" : "h-[180px]"
      )}
    >
      <Image
        src={imageData.assetUrl}
        alt="image-list"
        fill
        style={{ objectFit: "cover" }}
        onError={(e) => {}}
        crossOrigin="anonymous"
      />
    </div>
  ) : (
    <div className="relative">
      <video
        src={imageData?.assetUrl}
        className={cn(
          "rounded-lg object-cover w-full",
          size == "small"
            ? "max-h-[86px] h-[86px] min-h-[86px]"
            : "max-h-[180px] h-[180px] min-h-[180px]"
        )}
        crossOrigin="anonymous"
      />
      <Image
        src={PlayIcon} // local import or URL
        alt="play-icon"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        width={32}
        height={32}
      />
    </div>
  );
};

function ImageList({ assets, setAssets }: ImageListProps) {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);
  const [data, setData] = useState<DataFileType[]>([]);
  const { setProductAssets, singleProductData } = useProductStore();

  // ======================================= edit single product assests =======================================
  useEffect(() => {
    if (singleProductData.assets && Object.keys(singleProductData).length > 0) {
      setAssets(singleProductData.assets);
      setProductAssets(singleProductData.assets);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleProductData.assets]);

  useEffect(() => {
    if (assets.length > 0 && singleProductData.assets) {
      setData(assets);
    }
  }, [assets, singleProductData]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;

    if (!files) return;

    for (const File of files) {
      if (File.size > 2000000) {
        errorToast("File size exceeds 2MB");
        return;
      }
    }

    const fileArray = Array.from(files) as File[];
    const currentLength = data?.length || 0;
    const newData = fileArray.map((file, index) => {
      const fileType = file.type.startsWith("image") ? "IMAGE" : "VIDEO";
      const url = URL.createObjectURL(file);

      const number = currentLength + index + 1;
      return {
        id: number.toString(),
        assetUrl: url,
        file: file,
        fileType,
        metadata: {
          mimeType: file.type,
        },
      };
    }) as DataFileType[];

    // const fileNames = fileArray.map((file) => file.name).join(", ");
    setData((prev) => [...prev, ...newData]);
  };
  // console.log(data);
  
  return (
    <>
      <div className={cn("grid gap-2", data.length >= 1 && "grid-cols-2")}>
        {data.slice(0, 3).map((image, i) => (
          <div className={cn("relative imageUpload")} key={i}>
            <DisplayImage imageData={image} size="large" />
          </div>
        ))}

        {data.length >= 4 ? (
          <div className="relative grid grid-cols-2 gap-2">
            {data.slice(3, 7).map((image, i) => (
              <div className={cn("relative imageUpload")} key={i + 3}>
                <DisplayImage imageData={image} size="small" />

                {i + 3 === 6 && (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <button className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white text-Gray-700 pe-1 ps-2 py-[3px] rounded-md text-xs border border-Gray-300 font-medium min-w-[70px] max-w-full">
                        More{" "}
                        <span className="px-1 rounded-[3px] bg-Gray-100">
                          {data.length}
                        </span>
                      </button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
            ))}
            <div
              className={cn(
                "block max-h-[86px] h-[86px] min-h-[86px]",
                data.length >= 7 && "hidden",
              )}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              <ImageUploadSection disabled variant="small" />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "block max-h-[180px]",
              data.length == 2 && "col-span-full",
              // data.length >= 4 && "hidden",
            )}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <ImageUploadSection disabled />
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <ImageListedModal
          data={data}
          setData={setData}
          onChange={onChange}
          toggleOpen={toggleOpen}
          setAssets={setAssets}
          assets={assets}
          setProductAssets={setProductAssets}
        />
      </Dialog>
    </>
  );
}

export default ImageList;
