import { useEffect, useRef, useState } from "react";
import {
  Contrast,
  Sun,
  Moon,
  MonitorSmartphone,
  Eye,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { useAccessibility, type ColorblindMode, type ThemeMode } from "../lib/accessibility";

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Automático", icon: MonitorSmartphone },
];

const colorblindOptions: { value: ColorblindMode; label: string }[] = [
  { value: "none", label: "Nenhum" },
  { value: "protanopia", label: "Protanopia" },
  { value: "deuteranopia", label: "Deuteranopia" },
  { value: "tritanopia", label: "Tritanopia" },
];

const POS_KEY = "plantid_a11y_fab_pos";

/** Ícone clássico de acessibilidade (hominho com braços abertos). */
function AccessibilityPersonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* cabeça */}
      <circle cx="12" cy="4.5" r="2.2" />
      {/* braços abertos + tronco */}
      <path d="M4.5 9.2c0-.6.5-1.1 1.1-1.1h12.8c.6 0 1.1.5 1.1 1.1 0 .6-.5 1.1-1.1 1.1h-4.2v3.2l3.6 7.2c.2.5 0 1.1-.5 1.3-.5.2-1.1 0-1.3-.5L12 14.8l-3.9 7.6c-.2.5-.8.7-1.3.5-.5-.2-.7-.8-.5-1.3l3.6-7.2V10.3H5.6c-.6 0-1.1-.5-1.1-1.1z" />
    </svg>
  );
}

type Pos = { x: number; y: number };

function loadPos(): Pos | null {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (typeof p.x === "number" && typeof p.y === "number") return p;
  } catch {
    /* ignore */
  }
  return null;
}

function clampPos(x: number, y: number, size = 48): Pos {
  const maxX = Math.max(0, window.innerWidth - size);
  const maxY = Math.max(0, window.innerHeight - size);
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  };
}

export function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const dragging = useRef(false);
  const moved = useRef(false);
  const start = useRef({ px: 0, py: 0, x: 0, y: 0 });
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const {
    highContrast,
    setHighContrast,
    theme,
    setTheme,
    colorblindMode,
    setColorblindMode,
    fontScale,
    increaseFontScale,
    decreaseFontScale,
    resetFontScale,
  } = useAccessibility();

  // Posição inicial: salva ou canto inferior direito (acima da nav)
  useEffect(() => {
    const saved = loadPos();
    if (saved) {
      setPos(clampPos(saved.x, saved.y));
    } else {
      setPos(
        clampPos(
          window.innerWidth - 16 - 48,
          window.innerHeight - 96 - 48
        )
      );
    }

    const onResize = () => {
      setPos((current) => {
        if (!current) return current;
        return clampPos(current.x, current.y);
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!pos) return;
    dragging.current = true;
    moved.current = false;
    start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.px;
    const dy = e.clientY - start.current.py;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved.current = true;
    const next = clampPos(start.current.x + dx, start.current.y + dy);
    setPos(next);
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (pos) {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    }
    // Só abre o menu se não foi arraste
    if (!moved.current) {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Abrir opções de acessibilidade (arraste para mover)"
        title="Acessibilidade — arraste para mover"
        className="a11y-fab fixed z-40 rounded-full p-3 border-2 border-white shadow-lg transition-shadow touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-2"
        style={
          pos
            ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" }
            : { right: 16, bottom: 96 }
        }
      >
        <AccessibilityPersonIcon className="w-6 h-6" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <AccessibilityPersonIcon className="w-5 h-5 text-blue-700" />
              Acessibilidade
            </DrawerTitle>
            <DrawerDescription>
              Ajuste a exibição do app. Você pode arrastar o botão na tela para não cobrir o conteúdo.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Contrast className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Alto Contraste</p>
                  <p className="text-xs text-gray-500">Aumenta o contraste das cores</p>
                </div>
              </div>
              <Switch checked={highContrast} onCheckedChange={setHighContrast} />
            </div>

            <div>
              <p className="font-medium text-gray-800 mb-2">Tema</p>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                        isActive
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Eye className="w-5 h-5 text-gray-700" />
                </div>
                <p className="font-medium text-gray-800">Paleta para Daltonismo</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {colorblindOptions.map((opt) => {
                  const isActive = colorblindMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setColorblindMode(opt.value)}
                      className={`p-2.5 rounded-lg border text-sm transition-colors ${
                        isActive
                          ? "border-green-600 bg-green-50 text-green-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-800 mb-2">Tamanho da Fonte</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseFontScale}
                  aria-label="Diminuir fonte"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center text-sm text-gray-600">
                  {Math.round(fontScale * 100)}%
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseFontScale}
                  aria-label="Aumentar fonte"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFontScale}
                  aria-label="Restaurar tamanho padrão"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
