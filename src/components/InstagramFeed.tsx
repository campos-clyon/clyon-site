"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";

interface InstagramPost {
  id: string;
  type: string;
  url: string;
  permalink: string;
  caption: string;
  timestamp: string;
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/instagram");
        const data = await response.json();
        
        if (!response.ok) {
          console.error("[v0] Instagram API error:", data);
          setError(data.error || "Erro ao carregar");
          return;
        }
        
        setPosts(data.media || []);
      } catch (err) {
        console.error("[v0] Erro Instagram fetch:", err);
        setError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Em produção, não mostrar se houver erro
  if (error && process.env.NODE_ENV === "production") {
    return null;
  }

  // Em desenvolvimento, mostrar erro para debug
  if (error) {
    return (
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">Instagram Error: {error}</p>
          <p className="text-sm text-slate-500 mt-2">Verifique os logs do servidor</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Siga-nos no Instagram
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              @clyonportugal
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Link
            href="https://www.instagram.com/clyonportugal/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900 transition-colors hover:text-cyan-600"
          >
            <Instagram className="h-8 w-8" />
            Siga-nos no Instagram
          </Link>
          <p className="mt-3 text-lg text-slate-600">
            Veja os nossos trabalhos mais recentes
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {posts.slice(0, 6).map((post) => (
            <Link
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-200"
            >
              <Image
                src={post.url}
                alt={post.caption || "Post Instagram CLYON"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="line-clamp-2 text-sm text-white">
                    {post.caption || "Ver no Instagram"}
                  </p>
                </div>
              </div>
              <div className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                <Instagram className="h-4 w-4 text-pink-600" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="https://www.instagram.com/clyonportugal/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
          >
            <Instagram className="h-5 w-5" />
            Seguir @clyonportugal
          </Link>
        </div>
      </div>
    </section>
  );
}
