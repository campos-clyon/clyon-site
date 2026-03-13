import { useState } from 'react';
import { ChevronRight, Clock, Calendar, Tag, ArrowLeft, BookOpen, Truck, Home, Wrench, DollarSign } from 'lucide-react';
import { Helmet } from 'react-helmet';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  readTime: number;
  slug: string;
  keywords: string[];
  image: string;
  featured?: boolean;
}

const categoryConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  'Serviços': { color: 'text-cyan-700', bg: 'bg-cyan-100', icon: <Truck className="w-3 h-3" /> },
  'Mudanças': { color: 'text-purple-700', bg: 'bg-purple-100', icon: <Home className="w-3 h-3" /> },
  'Limpeza': { color: 'text-emerald-700', bg: 'bg-emerald-100', icon: <Wrench className="w-3 h-3" /> },
  'Preços': { color: 'text-amber-700', bg: 'bg-amber-100', icon: <DollarSign className="w-3 h-3" /> },
};

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Remoção de Entulho em Lisboa — Guia Completo 2026',
    excerpt: 'Descubra como a CLYON oferece soluções rápidas e económicas para remoção de entulho em Lisboa. Saiba quanto custa e como solicitar um orçamento.',
    slug: 'remocao-entulho-lisboa-2026',
    date: '2026-02-09',
    author: 'CLYON',
    category: 'Serviços',
    readTime: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    keywords: ['remoção de entulho', 'entulho Lisboa', 'remoção de lixo', 'limpeza'],
    content: `
# Remoção de Entulho em Lisboa — Guia Completo 2026

## O que é Remoção de Entulho?

A remoção de entulho refere-se ao transporte e eliminação adequada de resíduos de construção, demolição e limpeza. Em Lisboa, este serviço é essencial para proprietários, construtoras e empresas que precisam de manter espaços limpos e organizados.

## Por Que Escolher a CLYON?

A CLYON é especializada em remoção rápida e segura de entulho em Lisboa. Oferecemos:

- **Serviço Rápido**: Recolha no mesmo dia ou próximo dia útil
- **Preços Competitivos**: Orçamentos sem compromisso
- **Profissionais Experientes**: Equipa treinada e certificada
- **Responsabilidade Ambiental**: Reciclagem e disposição adequada

## Quanto Custa Remover Entulho?

Os preços variam conforme o volume e tipo de entulho. Contacte-nos para um orçamento personalizado.

## Como Solicitar o Serviço?

1. Contacte-nos por telefone ou formulário online
2. Descreva o tipo e volume de entulho
3. Receba um orçamento gratuito
4. Agende a recolha
5. Desfrute de um espaço limpo e organizado

**Contacte a CLYON hoje para uma remoção de entulho sem stress!**
    `
  },
  {
    id: '2',
    title: 'Mudança Rápida e Segura — Como a CLYON Faz Diferença',
    excerpt: 'Aprenda como a CLYON torna mudanças económicas e sem stress. Dicas profissionais para organizar sua mudança em Lisboa.',
    slug: 'mudanca-rapida-segura-clyon',
    date: '2026-02-08',
    author: 'CLYON',
    category: 'Mudanças',
    readTime: 6,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    keywords: ['mudança Lisboa', 'mudança económica', 'serviço mudança', 'transporte móveis'],
    content: `
# Mudança Rápida e Segura — Como a CLYON Faz Diferença

## Mudança Sem Stress é Possível

Mudar de casa é uma tarefa desafiadora. A CLYON transforma este processo em algo simples e económico.

## Serviços de Mudança da CLYON

- Recolha e transporte de móveis
- Embalagem profissional
- Desembalagem no novo local
- Remoção de entulho pós-mudança
- Limpeza de imóvel anterior

## Dicas para uma Mudança Bem-Sucedida

1. **Planeie com Antecedência**: Reserve com 2-3 semanas de antecedência
2. **Organize Seus Pertences**: Separe o que quer levar
3. **Etiquete as Caixas**: Facilita a desembalagem
4. **Proteja Móveis Frágeis**: Use materiais de proteção adequados

**Solicite um orçamento gratuito e veja como podemos ajudar na sua mudança!**
    `
  },
  {
    id: '3',
    title: 'Limpeza Pós-Obra: Serviços Profissionais em Lisboa',
    excerpt: 'Após uma obra, a limpeza é crucial. Descubra como a CLYON oferece serviços de limpeza pós-obra profissionais e eficientes.',
    slug: 'limpeza-pos-obra-lisboa',
    date: '2026-02-07',
    author: 'CLYON',
    category: 'Limpeza',
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    keywords: ['limpeza pós-obra', 'limpeza após construção', 'remoção de resíduos', 'limpeza profissional'],
    content: `
# Limpeza Pós-Obra: Serviços Profissionais em Lisboa

## A Importância da Limpeza Pós-Obra

Após uma obra, o espaço fica repleto de poeira, resíduos e sujidade. A limpeza profissional é essencial para tornar o espaço habitável e seguro.

## O Que Inclui a Limpeza Pós-Obra?

- Remoção de entulho e resíduos
- Limpeza de pó e sujidade
- Limpeza de vidros e superfícies
- Limpeza de pisos
- Organização final do espaço

**Deixe a limpeza pós-obra para os profissionais!**
    `
  },
  {
    id: '4',
    title: 'Quanto Custa Remover Entulho? Preços e Orçamentos',
    excerpt: 'Guia de preços para remoção de entulho em Lisboa. Entenda os fatores que influenciam o custo e como obter o melhor preço.',
    slug: 'custo-remocao-entulho-precos',
    date: '2026-02-06',
    author: 'CLYON',
    category: 'Preços',
    readTime: 4,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    keywords: ['preço remoção entulho', 'custo entulho', 'orçamento remoção', 'preço mudança'],
    content: `
# Quanto Custa Remover Entulho? Preços e Orçamentos

## Fatores que Influenciam o Preço

O custo de remoção de entulho depende de vários fatores:

### 1. Volume de Entulho
- Pequeno volume: €50-100
- Médio volume: €100-250
- Grande volume: €250+

### 2. Tipo de Entulho
- Lixo doméstico: mais económico
- Resíduos de construção: preço médio
- Materiais especiais: preço mais elevado

**Não pague mais! Solicite um orçamento gratuito da CLYON hoje.**
    `
  },
  {
    id: '5',
    title: 'Serviços de Mudança Económica em Lisboa — Sem Stress',
    excerpt: 'Mudança económica não significa qualidade inferior. Descubra como a CLYON oferece serviços de mudança acessíveis sem comprometer a segurança.',
    slug: 'mudanca-economica-lisboa-sem-stress',
    date: '2026-02-05',
    author: 'CLYON',
    category: 'Mudanças',
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    keywords: ['mudança económica', 'mudança barata', 'mudança acessível', 'melhor preço mudança'],
    content: `
# Serviços de Mudança Económica em Lisboa — Sem Stress

## Mudança Económica é Possível

Mudar de casa não precisa ser caro. A CLYON oferece serviços de mudança económicos sem comprometer a qualidade.

## Pacotes de Mudança Económica

### Mudança Básica
- Transporte de móveis
- Preço: A partir de €200

### Mudança Completa
- Embalagem profissional + transporte + desembalagem
- Preço: A partir de €400

**Solicite um orçamento gratuito e descubra como podemos ajudar na sua mudança económica!**
    `
  }
];

const allCategories = ['Todos', ...Array.from(new Set(blogPosts.map(p => p.category)))];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function CategoryBadge({ category }: { category: string }) {
  const cfg = categoryConfig[category] ?? { color: 'text-gray-700', bg: 'bg-gray-100', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
      {category}
    </span>
  );
}

function PostDetail({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-8 font-medium group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Voltar ao Blog
      </button>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-64 md:h-80">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <CategoryBadge category={post.category} />
        </div>
      </div>

      <article>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-500" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-500" />
            {post.readTime} min de leitura
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-500" />
            {post.author}
          </span>
        </div>

        <div className="prose prose-lg max-w-none text-slate-700">
          {post.content.split('\n').map((line, idx) => {
            if (line.startsWith('# ')) return <h1 key={idx} className="text-3xl font-extrabold text-slate-900 mt-8 mb-4">{line.slice(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-slate-800 mt-6 mb-3 border-l-4 border-cyan-500 pl-4">{line.slice(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-slate-700 mt-4 mb-2">{line.slice(4)}</h3>;
            if (line.startsWith('- ')) {
              const text = line.slice(2);
              const parts = text.split(/\*\*(.*?)\*\*/g);
              return (
                <li key={idx} className="ml-4 mb-1 list-disc text-gray-700">
                  {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}
                </li>
              );
            }
            if (/^\d+\./.test(line)) {
              const text = line.replace(/^\d+\.\s*/, '');
              const parts = text.split(/\*\*(.*?)\*\*/g);
              return (
                <li key={idx} className="ml-4 mb-1 list-decimal text-gray-700">
                  {parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}
                </li>
              );
            }
            if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={idx} className="font-bold text-slate-900 my-3">{line.slice(2, -2)}</p>;
            }
            if (line.trim()) {
              const parts = line.split(/\*\*(.*?)\*\*/g);
              return <p key={idx} className="mb-4 leading-relaxed">{parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p)}</p>;
            }
            return null;
          })}
        </div>

        {/* Tags */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {post.keywords.map(k => (
              <span key={k} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-cyan-50 hover:text-cyan-700 transition-colors cursor-default">
                <Tag className="w-3 h-3" />
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-2xl font-extrabold mb-2">Precisa de Ajuda?</h3>
          <p className="text-cyan-100 mb-6">Contacte a CLYON para um orçamento gratuito e sem compromisso.</p>
          <a
            href="https://wa.me/351939444557"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-cyan-600 font-bold px-8 py-3 rounded-xl hover:bg-cyan-50 transition-colors shadow"
          >
            Pedir Orçamento Grátis
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </article>
    </div>
  );
}

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const featured = blogPosts.find(p => p.featured);
  const filteredPosts = blogPosts.filter(p => {
    if (activeCategory !== 'Todos' && p.category !== activeCategory) return false;
    return true;
  });
  const gridPosts = filteredPosts.filter(p => !p.featured || activeCategory !== 'Todos');
  const showFeatured = activeCategory === 'Todos' && featured;

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog de Dicas sobre Recolha e Limpeza | CLYON</title>
        <meta name="description" content="Leia dicas e guias sobre recolha de móveis, entulho, limpeza pós-obra e muito mais. Artigos úteis para melhorar sua qualidade de vida." />
        <meta name="keywords" content="blog recolha, dicas limpeza, guia entulho, recolha móveis, limpeza pós-obra, mudanças" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://clyon.pt/blog" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-4 h-4" />
              Blog & Dicas
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Dicas e Guias<br />
              <span className="text-cyan-100">para o seu Lar</span>
            </h1>
            <p className="text-lg text-cyan-100 mb-8 max-w-lg">
              Artigos sobre mudanças, remoção de entulho, limpeza profissional e muito mais — escritos pelos especialistas da CLYON.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 font-semibold">
                {blogPosts.length} Artigos
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 font-semibold">
                4 Categorias
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 font-semibold">
                Atualizado 2026
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* Featured Post */}
        {showFeatured && featured && (
          <div
            onClick={() => setSelectedPost(featured)}
            className="group relative rounded-2xl overflow-hidden cursor-pointer mb-12 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="relative h-72 md:h-96">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Destaque
                </span>
                <CategoryBadge category={featured.category} />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight group-hover:text-cyan-200 transition-colors">
                {featured.title}
              </h2>
              <p className="text-gray-300 text-sm md:text-base mb-4 max-w-2xl line-clamp-2">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(featured.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.readTime} min
                </span>
                <span className="ml-auto text-cyan-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ler artigo <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-200'
                  : 'bg-white text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridPosts.map(post => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-3 left-3">
                  <CategoryBadge category={post.category} />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString('pt-PT')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime} min
                  </span>
                  <span className="flex items-center gap-1 text-cyan-600 font-semibold group-hover:gap-2 transition-all">
                    Ler <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-10 text-center shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400 rounded-full -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-extrabold mb-3">Precisa de um Serviço Agora?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-lg mx-auto">
              Solicite um orçamento gratuito e sem compromisso. Respondemos em minutos.
            </p>
            <a
              href="https://wa.me/351939444557"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-cyan-900/30"
            >
              Pedir Orçamento Grátis
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
