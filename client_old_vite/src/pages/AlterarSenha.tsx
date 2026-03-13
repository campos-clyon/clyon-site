import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff, Lock } from "lucide-react";

export default function AlterarSenha() {
  const [, setLocation] = useLocation();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError("A nova senha e confirmação não coincidem");
      return;
    }

    if (novaSenha.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (senhaAtual === novaSenha) {
      setError("A nova senha não pode ser igual à senha atual");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("colaborador_token");
    if (!token) {
      setLocation("/colaboradores");
      return;
    }

    try {
      const response = await fetch("/api/colaboradores/alterar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          senhaAtual,
          novaSenha
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao alterar senha");
      }

      setSuccess("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      // Redirecionar após 2 segundos
      setTimeout(() => {
        setLocation("/colaboradores/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0a1f3d] via-[#0d2847] to-[#0a1f3d] flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#0097b2] rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#0097b2]">
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Atualize sua senha para maior segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAlterarSenha} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senhaAtual">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="senhaAtual"
                  type={showSenhaAtual ? "text" : "password"}
                  placeholder="Digite sua senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showSenhaAtual ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="novaSenha"
                  type={showNovaSenha ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showNovaSenha ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmarSenha ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmarSenha ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-md">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#0097b2] hover:bg-[#007a8f] text-white font-semibold h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </form>

          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={() => setLocation("/colaboradores/dashboard")}
            disabled={loading}
          >
            Voltar ao Dashboard
          </Button>
        </CardContent>
        </Card>
      </div>
    </>
  );
}
