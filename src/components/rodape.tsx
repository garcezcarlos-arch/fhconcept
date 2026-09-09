import Link from "next/link";
import { SITE } from "@/lib/site";
import { linkWhatsapp } from "@/lib/preco";

export function Rodape() {
  return (
    <footer className="mt-24 border-t border-linha">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 text-sm md:grid-cols-4 md:px-10">
        <div>
          <img src="/fh-concept.svg" alt="FH Concept" className="h-9 w-auto" />
          <address className="mt-5 not-italic leading-relaxed text-carvao/60">
            {SITE.rua}<br />
            {SITE.bairro} · {SITE.cidade}/{SITE.uf} · {SITE.cep}<br />
            <a href={linkWhatsapp("Oi! Vim pelo site.")} target="_blank" rel="noopener" className="hover:text-nude">(47) 99642-6656</a>
          </address>
        </div>

        <div>
          <p className="font-serif text-base">O salão</p>
          <div className="mt-3 flex flex-col gap-2 text-carvao/60">
            <Link href="/servicos" className="hover:text-nude">Serviços</Link>
            <Link href="/equipe" className="hover:text-nude">Equipe</Link>
            <Link href="/loja" className="hover:text-nude">Produtos</Link>
            <Link href="/contato" className="hover:text-nude">Como chegar</Link>
          </div>
        </div>

        <div>
          <p className="font-serif text-base">Para profissionais</p>
          <div className="mt-3 flex flex-col gap-2 text-carvao/60">
            <Link href="/formacoes" className="hover:text-nude">Formações</Link>
            <Link href="/formacoes#turma" className="hover:text-nude">Curso em turma</Link>
            <Link href="/formacoes#shadow-day" className="hover:text-nude">Shadow Day</Link>
            <Link href="/formacoes#mentoria" className="hover:text-nude">Mentoria técnica</Link>
          </div>
        </div>

        <div>
          <p className="font-serif text-base">Horários</p>
          <p className="mt-3 leading-relaxed text-carvao/60">
            Terça a sábado<br />8h30–12h · 13h30–18h30<br />Com hora marcada
          </p>
          <p className="mt-6 font-serif text-base">Redes</p>
          <div className="mt-3 flex flex-col gap-2 text-carvao/60">
            <a href={SITE.instagram} target="_blank" rel="noopener" className="hover:text-nude">@fernandahosangconcept</a>
            <a href="https://instagram.com/juaraujocachos" target="_blank" rel="noopener" className="hover:text-nude">@juaraujocachos</a>
            <a href="https://instagram.com/lauraelisa.beauty" target="_blank" rel="noopener" className="hover:text-nude">@lauraelisa.beauty</a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-1 border-t border-linha px-5 py-6 text-xs text-carvao/45 md:flex-row md:justify-between md:px-10">
        <span>© 2026 Fernanda Hosang Concept · CNPJ 19.417.911/0001-47</span>
        <span>Garuva · Joinville · Itapoá · Guaratuba</span>
      </div>
    </footer>
  );
}
