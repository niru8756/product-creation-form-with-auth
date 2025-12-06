"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { LogOut, Plus, Search, LayoutDashboard, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: session, status } = useSession();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        // Ensure data is always an array
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      }
      setLoading(false);
    };
    load();
  }, []);


  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const filteredProducts = (products || [])?.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-white">


      {/* Main Content */}
      <main className="flex-1 pb-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#101828] mb-2">Welcome back, {session?.user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-600">Here's an overview of your product catalog</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-[#F75A27] hover:shadow-lg transition-all duration-200 group cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Total Products</p>
                <p className="text-3xl font-bold text-[#101828]">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-[#F75A27]/20 group-hover:text-[#F75A27]/40 transition-colors" />
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#101828]">Products</h2>
              <p className="text-sm text-gray-600 mt-1">{filteredProducts?.length} product{filteredProducts?.length !== 1 ? 's' : ''}</p>
            </div>
            {products.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#F75A27] focus:ring-2 focus:ring-[#F75A27]/10 transition-all"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-[#F75A27]"></div>
            </div>
          ) : filteredProducts?.length === 0 ? (
            <EmptyState router={router} />
          ) : (
            <ProductTable products={filteredProducts} router={router} />
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState({ router }: { router: any }) {
  return (
    <div className="border border-gray-200 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
      <div className="inline-block p-3 bg-[#F75A27]/10 rounded-lg mb-4">
        <Package className="w-8 h-8 text-[#F75A27]" />
      </div>
      <h3 className="text-lg font-bold text-[#101828] mb-2">No products yet</h3>
      <p className="text-gray-600 text-sm mb-8">Start by creating your first product to begin managing your catalog</p>
      <button
        onClick={() => router.push("/dashboard/product-create")}
        className="inline-flex items-center gap-2 bg-[#F75A27] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e15123] hover:shadow-lg transition-all duration-200 group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Create First Product
      </button>
    </div>
  );
}

function ProductTable({ products, router }: { products: Product[]; router: any }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[#101828]">Product Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[#101828]">SKU</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[#101828]">Price</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-[#101828]">Created On</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-[#F75A27]/5 cursor-pointer transition-all duration-150 group"
              onClick={() => window.location.assign(`/product/${product.id}`)}
            >
              <td className="px-6 py-4 text-sm font-semibold text-[#101828] group-hover:text-[#F75A27] transition-colors">{product.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600 font-mono">{product.sku}</td>
              <td className="px-6 py-4 text-sm font-semibold text-[#101828]">₹{product.price.toLocaleString()}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}