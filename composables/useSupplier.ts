import type { Supplier } from "~/types";

export const useSupplier = () => {
  const toast = useToast();
  const i18n = useI18n();

  const suppliers = ref<Supplier[]>();

  const getSuppliers = async (paranoid: boolean = false) => {
    try {
      suppliers.value = await $fetch("/api/supplier/all", {
        method: "GET",
        query: {
          paranoid,
        },
      });
    } catch (error: any) {}
  };

  const addSupplier = async (state: {
    company: string | undefined;
    city: string | undefined;
    address: string | undefined;
    tel: string | undefined;
  }) => {
    try {
      await $fetch("/api/supplier/add", {
        method: "POST",
        body: state,
      });

      toast.add({
        title: i18n.t("components.supplier.add.toasts.supplier-added"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getSuppliers();
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

  const updateSupplier = async (state: {
    id: number | undefined;
    company: string | undefined;
    city: string | undefined;
    address: string | undefined;
    tel: string | undefined;
  }) => {
    try {
      await $fetch("/api/supplier/update", {
        method: "PATCH",
        body: state,
      });

      toast.add({
        title: i18n.t("components.supplier.update.toasts.supplier-updated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getSuppliers();
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

  const deactivateSupplier = async (id: number) => {
    try {
      await $fetch("/api/supplier/deactivate", {
        method: "PUT",
        body: {
          id,
        },
      });

      toast.add({
        title: i18n.t("components.supplier.update.toasts.supplier-deactivated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getSuppliers();
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

  const restoreSupplier = async (id: number) => {
    try {
      await $fetch("/api/supplier/restore", {
        method: "PUT",
        body: {
          id,
        },
      });

      toast.add({
        title: i18n.t("components.supplier.update.toasts.supplier-restored"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getSuppliers();
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

  const deleteSupplier = async (id: number) => {
    try {
      await $fetch("/api/supplier/delete", {
        method: "PUT",
        body: {
          id,
        },
      });

      toast.add({
        title: i18n.t("components.supplier.update.toasts.supplier-deleted"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getSuppliers();
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
    suppliers,

    getSuppliers,
    addSupplier,
    updateSupplier,
    deactivateSupplier,
    restoreSupplier,
    deleteSupplier,
  };
};
