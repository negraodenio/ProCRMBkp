"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  PlusCircle,
  X
} from "lucide-react";
import { getDealProducts, addProductToDeal } from "@/app/deals/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Product {
    id: string;
    name: string;
    base_price: number;
    category?: string;
}

interface DealProductsTabProps {
  dealId: string;
}

export function DealProductsTab({ dealId }: DealProductsTabProps) {
  const [dealProducts, setDealProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [dealId]);

  async function loadProducts() {
    setLoading(true);
    const result = await getDealProducts(dealId);
    if (result.success) {
      setDealProducts(result.data || []);
    }
    setLoading(false);
  }

  const totalValue = dealProducts.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Package className="h-5 w-5 text-cyan-600" />
               Produtos e Serviços
            </h2>
            <p className="text-xs text-slate-500">Gerencie os itens vinculados a esta negociaçío</p>
          </div>
          <div className="flex gap-2">
            <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Adicionar item
            </button>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Itens</span>
                    <span className="text-xl font-bold text-slate-900">{dealProducts.length}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Package className="h-5 w-5 text-slate-400" />
                </div>
            </div>
            <div className="bg-cyan-50 border-cyan-100 p-4 rounded-xl border shadow-sm flex items-center justify-between md:col-span-2">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Valor Total da Negociaçío</span>
                    <span className="text-2xl font-black text-cyan-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                    </span>
                </div>
                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-cyan-600" />
                </div>
            </div>
        </div>

        {/* Product List Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Buscar itens na lista..."
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Disponível</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b">
                <tr>
                  <th className="px-6 py-4">Nome do Produto / Serviço</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4 text-center">Quantidade</th>
                  <th className="px-6 py-4 text-right">Valor Unit.</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center animate-pulse text-slate-400">
                      Carregando produtos...
                    </td>
                  </tr>
                ) : dealProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <Package className="h-12 w-12 text-slate-300" />
                        <p className="text-slate-500 font-medium">Nenhum produto vinculado a esta negociaçío</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-xs text-blue-600 hover:underline font-bold mt-2"
                        >
                            Clique aqui para adicionar o primeiro item
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dealProducts.map((dp) => (
                    <tr key={dp.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{dp.products?.name}</span>
                            <span className="text-[10px] text-slate-400">ID: {dp.id.slice(0,8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 border-none px-2 rounded-full">
                            {dp.products?.category || 'Geral'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">
                        {dp.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dp.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dp.total_price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      {/* Add Product Modal (Simple implementation for now) */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Adicionar Novo Produto</h3>
                    <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-200 rounded-full">
                        <X className="h-4 w-4 text-slate-500" />
                    </button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="py-4 text-center text-sm text-slate-400 italic">
                        Seleçío de produtos globais será integrada na próxima iteraçío.
                    </div>
                    <button
                        onClick={() => setShowAddForm(false)}
                        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
      )}
    </Card>
  );
}
