import type { Purchase } from "~/types";

export const usePurchase = () => {
  const toast = useToast();
  const i18n = useI18n();

  const purchases = ref<Purchase[]>();

  const getPurchases = async () => {
    try {
      purchases.value = await $fetch("/api/purchase/all", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  const outsidePurchases = ref<Purchase[]>();

  const getOutsidePurchases = async () => {
    try {
      outsidePurchases.value = await $fetch("/api/purchase/outside", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  const addPurchase = async (state: {
    date: string | undefined;
    amount: number | undefined;
    isDeclared: boolean | undefined;
    invoiceNumber: string | undefined;
    comment: string | undefined;
    shopId: string | undefined;
    supplier: string | undefined;
  }) => {
    try {
      await $fetch("/api/purchase/add", {
        method: "POST",
        body: state,
      });

      toast.add({
        title: i18n.t("components.purchase.add.toasts.purchase-added"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getPurchases();
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

  const updatePurchase = async (state: {
    id: number | undefined;
    date: string | undefined;
    amount: number | undefined;
    isDeclared: boolean | undefined;
    invoiceNumber: string | undefined;
    comment: string | undefined;
    shopId: string | undefined;
    supplierId: string | undefined;
  }) => {
    try {
      await $fetch("/api/purchase/update", {
        method: "PATCH",
        body: state,
      });

      toast.add({
        title: i18n.t("components.purchase.update.toasts.purchase-updated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getPurchases();
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

  const deletePurchase = async (id: number) => {
    try {
      await $fetch("/api/purchase/delete", {
        method: "PUT",
        body: {
          id,
        },
      });

      toast.add({
        title: i18n.t("components.purchase.update.toasts.purchase-deleted"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getPurchases();
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
    purchases,
    getPurchases,

    outsidePurchases,
    getOutsidePurchases,

    addPurchase,
    updatePurchase,
    deletePurchase,
  };
};
