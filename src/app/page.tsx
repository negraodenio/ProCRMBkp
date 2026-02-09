import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  Shield,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Target,
  Globe
} from "lucide-react";

export default async function LandingPage() {
  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "PT";
  const isBR = country === "BR";

  const currency = isBR ? "R$" : "€";
  const prices = {
    starter: isBR ? "129" : "29",
    pro: isBR ? "349" : "79",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-gradient" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ProCRM
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition">Funcionalidades</a>
            <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition">Preços</a>
            <a href="#demo" className="text-slate-600 hover:text-blue-600 transition">Demo</a>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Começar Grátis
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm text-blue-600 font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>CRM com IA - 90% Mais Barato</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Venda Mais com
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Inteligência Artificial
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed">
              O único CRM que prevê quando seus leads vão fechar, automatiza follow-ups
              e usa IA para aumentar suas vendas em até 35%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
                  Começar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>14 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Sem cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-2xl border">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm text-slate-600">Probabilidade de Fechar</p>
                    <p className="text-3xl font-bold text-green-600">87%</p>
                  </div>
                  <Target className="h-12 w-12 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-sm text-slate-600">Leads Qualificados IA</p>
                    <p className="text-3xl font-bold text-blue-600">142</p>
                  </div>
                  <Brain className="h-12 w-12 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="text-sm text-slate-600">Automações Ativas</p>
                    <p className="text-3xl font-bold text-purple-600">28</p>
                  </div>
                  <Zap className="h-12 w-12 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold">10.000+</p>
              <p className="text-sm md:text-base text-blue-100">Leads Gerenciados</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">35%</p>
              <p className="text-sm md:text-base text-blue-100">Aumento em Vendas</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">4h/dia</p>
              <p className="text-sm md:text-base text-blue-100">Tempo Economizado</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold">90%</p>
              <p className="text-sm md:text-base text-blue-100">Economia em IA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Funcionalidades que Nenhum CRM Tem
          </h2>
          <p className="text-lg md:text-xl text-slate-600">
            IA avançada que realmente funciona para aumentar suas vendas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 rounded-2xl border hover:border-blue-600 hover:shadow-xl transition">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4 group-hover:scale-110 transition">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Previsão de Fechamento</h3>
            <p className="text-slate-600 mb-4">
              IA que prevê com 87% de precisão quais leads vão fechar e quando.
              Foque nos negócios certos no momento certo.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Probabilidade em tempo real
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Estimativa de dias para fechar
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Sugestões de ação
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-2xl border hover:border-purple-600 hover:shadow-xl transition">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4 group-hover:scale-110 transition">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">WhatsApp + IA</h3>
            <p className="text-slate-600 mb-4">
              Cada mensagem do WhatsApp é analisada por IA. Detecta leads quentes,
              objeções e intenção de compra automaticamente.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Histórico unificado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Resumo automático por IA
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Alertas de lead quente
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-2xl border hover:border-green-600 hover:shadow-xl transition">
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-4 group-hover:scale-110 transition">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Automações Inteligentes</h3>
            <p className="text-slate-600 mb-4">
              Workflows que trabalham 24/7. Follow-ups automáticos, qualificação
              de leads e alertas em tempo real.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Follow-ups automáticos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Qualificação por IA
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Alertas inteligentes
              </li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 rounded-2xl border hover:border-orange-600 hover:shadow-xl transition">
            <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4 group-hover:scale-110 transition">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Dashboard Analytics</h3>
            <p className="text-slate-600 mb-4">
              Visualize seu funil em tempo real. Métricas que importam,
              sem enrolação. Saiba exatamente onde focar.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Funil de conversão visual
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Insights acionáveis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Métricas em tempo real
              </li>
            </ul>
          </div>

          {/* Feature 5 */}
          <div className="group p-8 rounded-2xl border hover:border-cyan-600 hover:shadow-xl transition">
            <div className="p-3 bg-cyan-100 rounded-lg w-fit mb-4 group-hover:scale-110 transition">
              <TrendingUp className="h-8 w-8 text-cyan-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Propostas Digitais</h3>
            <p className="text-slate-600 mb-4">
              Crie propostas profissionais em minutos. Acompanhe visualizações
              e saiba quando o cliente abriu.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Templates customizáveis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Tracking de visualizações
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Assinatura digital
              </li>
            </ul>
          </div>

          {/* Feature 6 */}
          <div className="group p-8 rounded-2xl border hover:border-pink-600 hover:shadow-xl transition">
            <div className="p-3 bg-pink-100 rounded-lg w-fit mb-4 group-hover:scale-110 transition">
              <Globe className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Multi-idioma PT/BR</h3>
            <p className="text-slate-600 mb-4">
              Interface 100% em português. Suporte para Brasil e Portugal.
              Times de vendas de ambos os países.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Interface em português
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Suporte localizado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                Multi-moeda (EUR/BRL)
              </li>
            </ul>
          </div>
        </div>
      </section>


      <section id="pricing" className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Preços Transparentes</h2>
            <p className="text-lg md:text-xl text-slate-600">
              Escolha o plano ideal para seu time de vendas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-white p-8 rounded-2xl border">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-slate-600 mb-6">Para começar a vender mais</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{currency}{prices.starter}</span>
                <span className="text-slate-600">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Até 500 leads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>1 usuário</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>IA Básica</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>WhatsApp integrado</span>
                </li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full">Começar Grátis</Button>
              </Link>
            </div>

            {/* Pro - Popular */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl text-white relative scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                MAIS POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-blue-100 mb-6">Para times que querem crescer</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{currency}{prices.pro}</span>
                <span className="text-blue-100">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                  <span>Até 5.000 leads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                  <span>5 usuários</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                  <span>IA Avançada</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                  <span>Automações ilimitadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                  <span>Propostas digitais</span>
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">Começar Agora</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-8 rounded-2xl border">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-slate-600 mb-6">Para grandes equipes</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{prices.enterprise}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Leads ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Usuários ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>IA Premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>White label</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Falar com Vendas</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fale Conosco
            </h2>
            <p className="text-lg text-slate-600">
              Dúvidas? Nossa equipe está pronta para ajudar!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border p-8 md:p-12">
            <form action="https://formspree.io/f/xvzbgwbj" method="POST" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nome *
                  </label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Seu nome completo"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="seu@email.com"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-2">
                    Empresa
                  </label>
                  <Input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Nome da sua empresa"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                    Telefone
                  </label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+351 / +55"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Como podemos ajudar?"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                />
              </div>

              <input type="hidden" name="_subject" value="Novo contato - ProCRM Landing Page" />
              <input type="hidden" name="_next" value="https://procrm.com/obrigado" />

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg"
              >
                Enviar Mensagem
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-sm text-slate-500 text-center">
                Respondemos em até 24 horas úteis
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto Para Vender 35% Mais?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já aumentaram suas vendas com IA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 w-full sm:w-auto">
                Começar Grátis por 14 Dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
              Agendar Demo
            </Button>
          </div>
          <p className="text-sm text-blue-100 mt-6">
            Sem cartão de crédito • Cancele quando quiser • Suporte em português
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">ProCRM</span>
              </div>
              <p className="text-slate-600 text-sm">
                O CRM com IA que aumenta suas vendas em 35%
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-blue-600">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-blue-600">Preços</a></li>
                <li><a href="#" className="hover:text-blue-600">Integrações</a></li>
                <li><a href="#" className="hover:text-blue-600">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600">Sobre</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600">Carreiras</a></li>
                <li><a href="#" className="hover:text-blue-600">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-blue-600">Documentação</a></li>
                <li><a href="#" className="hover:text-blue-600">Status</a></li>
                <li><a href="#" className="hover:text-blue-600">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-slate-600">
            <p>© 2026 ProCRM. Todos os direitos reservados. 🇵🇹 🇧🇷</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
