import { useState } from "react";
import { Blossom } from "../Illustrations";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { toast } from "sonner";
import { sendContactMessage, openWhatsApp, SUPPORT_WHATSAPP } from "../../lib/db";

const FAQ_ITEMS = [
  {
    question: "Como eu identifico uma planta pelo app?",
    answer:
      "Vá em 'Buscar', digite o nome (ou use a busca por voz) e escolha a planta na lista de resultados pra ver os detalhes e o guia de cuidados.",
  },
  {
    question: "Não encontrei minha planta na busca, e agora?",
    answer:
      "Toque em 'Solicitar esta planta' na tela de busca vazia — isso envia o pedido para nós (WhatsApp ou formulário). Também registramos buscas sem resultado automaticamente pra ampliar o catálogo.",
  },
  {
    question: "Como funciona o Medidor de Luz?",
    answer:
      "Ele usa a câmera do seu dispositivo pra estimar o nível de luminosidade do ambiente e compara com o que a planta que você selecionou precisa — inclusive as das suas Minhas Plantas.",
  },
  {
    question: "Esqueci minha senha, como recupero o acesso?",
    answer:
      "Na tela de login, toque em 'Esqueci minha senha' e siga as instruções enviadas para o seu e-mail cadastrado.",
  },
];

export function ContactPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleWhatsApp = () => {
    const name = [firstName, lastName].filter(Boolean).join(" ") || "usuário do PlantID";
    const body =
      message.trim() ||
      `Olá! Sou ${name} e gostaria de falar sobre o PlantID.`;
    openWhatsApp(body);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) {
      toast.error("Preencha todos os campos antes de enviar.");
      return;
    }

    setSending(true);
    const { error } = await sendContactMessage({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    setSending(false);

    if (error) {
      toast.error("Não foi possível enviar sua mensagem. Tente pelo WhatsApp.");
      return;
    }

    toast.success("Mensagem enviada! Em breve entraremos em contato.");
    setFirstName("");
    setLastName("");
    setEmail("");
    setMessage("");
  };

  const phoneDisplay = "+55 17 98149-1206";

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fale Conosco</h2>
          <p className="text-sm text-gray-500">Suporte e sugestões</p>
        </div>
      </div>

      <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
        <div className="flex items-start gap-3">
          <div className="bg-green-600 rounded-full p-3 shrink-0">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">WhatsApp (resposta mais rápida)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Fale direto conosco pelo WhatsApp:{" "}
              <span className="font-medium text-green-700">{phoneDisplay}</span>
            </p>
            <Button
              onClick={handleWhatsApp}
              className="mt-3 w-full bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Abrir WhatsApp
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Perguntas frequentes</h3>
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Blossom className="w-8 h-8 text-green-600" />
          <h3 className="font-semibold text-gray-800">Enviar mensagem pelo app</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
            <Input
              placeholder="Sobrenome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Textarea
            placeholder="Como podemos ajudar?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <Button
            type="submit"
            disabled={sending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Prefere WhatsApp? Use o botão acima — número {phoneDisplay}
        </p>
      </Card>
    </div>
  );
}
