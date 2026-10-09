import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Camera, Trash2, ImagePlus } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import {
  getMyPlants,
  getProgressPhotos,
  addProgressPhoto,
  deleteProgressPhoto,
  MyPlant,
  ProgressPhoto,
} from "../../lib/db";

export function ProgressPhotosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("plant") || "";

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [myPlants, setMyPlants] = useState<MyPlant[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState(preselected);
  const [note, setNote] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [plants, ph] = await Promise.all([getMyPlants(), getProgressPhotos()]);
    setMyPlants(plants);
    setPhotos(ph);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const selectedPlant = myPlants.find((p) => p.id === selectedPlantId) || null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem.");
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Escolha uma foto primeiro.");
      return;
    }
    if (!selectedPlant) {
      toast.error("Selecione uma planta da sua lista.");
      return;
    }

    setUploading(true);
    const { error, photo } = await addProgressPhoto({
      userPlantId: selectedPlant.id,
      plantName: selectedPlant.nickname || selectedPlant.name,
      note: note.trim(),
      file,
    });
    setUploading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Foto de progresso salva!");
    if (photo) setPhotos((prev) => [photo, ...prev]);
    setNote("");
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async (photo: ProgressPhoto) => {
    if (!confirm("Apagar esta foto de progresso?")) return;
    const { error } = await deleteProgressPhoto(photo.id);
    if (error) {
      toast.error(error);
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    toast.success("Foto removida.");
  };

  const filtered = selectedPlantId
    ? photos.filter((p) => p.userPlantId === selectedPlantId)
    : photos;

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
          <h2 className="text-2xl font-bold text-gray-800">Fotos de progresso</h2>
          <p className="text-sm text-gray-500">
            Registre a evolução das suas plantas (fica salvo mesmo após sair)
          </p>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-gray-800">Nova foto</h3>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Planta</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            value={selectedPlantId}
            onChange={(e) => setSelectedPlantId(e.target.value)}
          >
            <option value="">Selecione...</option>
            {myPlants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nickname || p.name}
              </option>
            ))}
          </select>
          {myPlants.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Adicione plantas em Minhas Plantas antes de registrar progresso.
            </p>
          )}
        </div>
        <Input
          placeholder="Anotação (opcional) — ex: após 2 semanas"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="w-4 h-4 mr-2" />
            Escolher foto
          </Button>
          <Button
            type="button"
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={uploading}
            onClick={handleUpload}
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            {uploading ? "Enviando..." : "Salvar"}
          </Button>
        </div>
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Prévia"
            className="w-full h-40 object-cover rounded-lg"
          />
        )}
      </Card>

      <div>
        <h3 className="font-semibold text-gray-800 mb-2">
          Histórico {selectedPlantId ? "(filtrado)" : ""}
        </h3>
        {loading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : filtered.length === 0 ? (
          <Card className="p-6 text-center text-gray-500 text-sm">
            Nenhuma foto ainda. Registre a evolução da sua planta!
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.plantName}
                  className="w-full h-48 object-cover bg-gray-100"
                />
                <div className="p-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800">{photo.plantName}</p>
                    {photo.note && (
                      <p className="text-sm text-gray-600 mt-0.5">{photo.note}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {photo.createdAt.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(photo)}
                    aria-label="Apagar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
