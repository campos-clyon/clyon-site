"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoricoHorasModalProps {
  isOpen: boolean;
  onClose: () => void;
  colaboradorId: number;
  colaboradorNome: string;
}

export function HistoricoHorasModal({
  isOpen,
  onClose,
  colaboradorId,
  colaboradorNome,
}: HistoricoHorasModalProps) {
  const [page, setPage] = useState(1);
  const [registros, setRegistros] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem("colaborador_token");
    if (!token) return;

    setIsLoading(true);
    fetch(`/api/colaboradores/historico?colaboradorId=${colaboradorId}&page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setRegistros(data.registros || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, colaboradorId, page]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
          <h2 className="text-2xl font-bold">Histórico de Horas — {colaboradorNome}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando histórico...</p>
              </div>
            </div>
          ) : registros.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 text-lg">Nenhum registro de horas encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Data", "Entrada", "Pausa", "Saída", "Horas", "Trabalhos", "Valor"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((registro, index) => {
                    const dataFormatada = registro.data
                      ? new Date(registro.data).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })
                      : "-";
                    return (
                      <tr key={index} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{dataFormatada}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{registro.horaEntrada}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{registro.horaPausa || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{registro.horaSaida || "-"}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-cyan-600">{registro.horasTrabalhadas}h</td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">{registro.numeroTrabalhos}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">€{registro.valorTotal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {registros.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">Página {page} de {totalPages} ({total} registros)</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" /> Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Próxima <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
