import type { Shop } from "~/types";

export const useShop = () => {
  const toast = useToast();
  const i18n = useI18n();

  const shops = ref<Shop[]>();

  const getShops = async (paranoid: boolean = false) => {
    try {
      shops.value = await $fetch("/api/shop/all", {
        method: "GET",
        query: {
          paranoid,
        },
      });
    } catch (error: any) {}
  };

  const addShop = async (state: {
    name: string | undefined;
  }) => {
    try {
      await $fetch("/api/shop/add", {
        method: "POST",
        body: state,
      });

      toast.add({
        title: i18n.t("components.shop.add.toasts.shop-added"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getShops();
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

  const updateShop = async (state: {
    id: number | undefined;
    name: string | undefined;
  }) => {
    try {
      await $fetch("/api/shop/update", {
        method: "PATCH",
        body: state,
      });

      toast.add({
        title: i18n.t("components.shop.update.toasts.shop-updated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getShops();
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

  const deactivateShop = async (id: number) => {
    try {
      await $fetch("/api/shop/deactivate", {
        method: "PUT",
        body: {
          id,
        },
      });

      toast.add({
        title: i18n.t("components.shop.update.toasts.shop-deactivated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getShops();
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

  const restoreShop = async (id: number) => {
    try {
      await $fetch("/api/shop/restore", {
        method: "PUT",
        body: {
          id,
        },
      });

      toast.add({
        title: i18n.t("components.shop.update.toasts.shop-restored"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getShops();
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

  const deleteShop = async (id: number) => {
    try {
      await $fetch("/api/shop/delete", {
        method: "PUT",
        body: {
          id,
        },
      });

      toast.add({
        title: i18n.t("components.shop.update.toasts.shop-deleted"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getShops();
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

  return {
    shops,

    getShops,
    addShop,
    updateShop,
    deactivateShop,
    restoreShop,
    deleteShop,
  };
};
