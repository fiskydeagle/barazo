import type { Draw, Purchase } from "~/types";
import { format } from "date-fns";

export const useDraw = () => {
  const toast = useToast();
  const i18n = useI18n();

  const draws = ref<Draw[]>();

  const getDraws = async () => {
    try {
      draws.value = await $fetch("/api/draw/all", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  const addDraw = async (state: {
    date: string | undefined;
    cashAmount: number | undefined;
    totalAmount: number | undefined;
    systemAmount: number | undefined;
    comment: string | undefined;
    shopId: string | undefined;
  }) => {
    try {
      await $fetch("/api/draw/add", {
        method: "POST",
        body: state,
      });

      toast.add({
        title: i18n.t("components.draw.add.toasts.draw-added"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getDraws();
    } catch (error: any) {
      toast.add({
        title: i18n.t(error.statusMessage),
        description: error.data.data ? error.data.data.join(", ") : undefined,
        color: "red",
        icon: "i-lucide-alert-triangle",
      });

      return false;
    }
    return true;
  };

  const updateDraw = async (state: {
    id: number | undefined;
    date: string | undefined;
    cashAmount: number | undefined;
    totalAmount: number | undefined;
    systemAmount: number | undefined;
    comment: string | undefined;
    shopId: string | undefined;
  }) => {
    try {
      await $fetch("/api/draw/update", {
        method: "PATCH",
        body: state,
      });

      toast.add({
        title: i18n.t("components.draw.update.toasts.draw-updated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getDraws();
    } catch (error: any) {
      toast.add({
        title: i18n.t(error.statusMessage),
        description: error.data.data ? error.data.data.join(", ") : undefined,
        color: "red",
        icon: "i-lucide-alert-triangle",
      });

      return false;
    }
    return true;
  };

  const deleteDraw = async (id: number) => {
    try {
      await $fetch("/api/draw/delete", {
        method: "PUT",
        body: {
          id,
        },
      });

      toast.add({
        title: i18n.t("components.draw.update.toasts.draw-deleted"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getDraws();
    } catch (error: any) {
      toast.add({
        title: i18n.t(error.statusMessage),
        description: error.data.data ? error.data.data.join(", ") : undefined,
        color: "red",
        icon: "i-lucide-alert-triangle",
      });

      return false;
    }
    return true;
  };

  const infos = ref<{
    purchases: Purchase[];
    draws: Draw[];
  }>();

  const getInfos = async (
    shopId: string,
    date: string = format(new Date(), "yyyy-MM-dd HH:mm"),
  ) => {
    try {
      infos.value = await $fetch("/api/draw/infos", {
        method: "GET",
        query: {
          shopId: shopId,
          date: date,
        },
      });
    } catch (error: any) {}
  };

  return {
    draws,

    getDraws,
    addDraw,
    updateDraw,
    deleteDraw,

    infos,
    getInfos,
  };
};
