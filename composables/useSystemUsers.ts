import type { User } from "~/types";
import { UserRole } from "~/types";
import { useAuthUser } from "~/composables/useAuthUser";

export const useSystemUsers = () => {
  const toast = useToast();
  const i18n = useI18n();
  const { user } = useAuthUser();

  const users = ref<User[]>();
  const getUsers = async () => {
    try {
      users.value = await $fetch("/api/user/all", {
        method: "GET",
      });
    } catch (error: any) {}
  };

  const addUser = async (state: {
    firstName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
    role: UserRole | undefined;
    shopId: string | undefined;
    password: string | undefined;
    city: string | undefined;
    address: string | undefined;
    tel: string | undefined;
  }) => {
    try {
      await $fetch("/api/user/add", {
        method: "POST",
        body: state,
      });

      toast.add({
        title: i18n.t("components.user.add.toasts.user-added"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUsers();
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

  const updateUser = async (state: {
    id: number | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    role: UserRole | undefined;
    shopId: string | undefined;
    city: string | undefined;
    address: string | undefined;
    tel: string | undefined;
  }) => {
    try {
      await $fetch("/api/user/update", {
        method: "PATCH",
        body: state,
      });

      toast.add({
        title: i18n.t("components.user.update.toasts.user-updated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUsers();
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

  const verifyUser = async (userId: number) => {
    try {
      await $fetch("/api/user/verify", {
        method: "PUT",
        body: {
          userId,
        },
      });

      toast.add({
        title: i18n.t("components.user.update.toasts.user-verified"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUsers();
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

  const deactivateUser = async (userId: number) => {
    try {
      await $fetch("/api/user/deactivate", {
        method: "PUT",
        body: {
          userId,
        },
      });

      toast.add({
        title: i18n.t("components.user.update.toasts.user-deactivated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUsers();
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

  const restoreUser = async (userId: number) => {
    try {
      await $fetch("/api/user/restore", {
        method: "PUT",
        body: {
          userId,
        },
      });

      toast.add({
        title: i18n.t("components.user.update.toasts.user-restored"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUsers();
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

  const deleteUser = async (userId: number) => {
    try {
      await $fetch("/api/user/delete", {
        method: "PUT",
        body: {
          userId,
        },
      });

      toast.add({
        title: i18n.t("components.user.update.toasts.user-deleted"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUsers();
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

  const updateProfile = async (state: {
    firstName: string | undefined;
    lastName: string | undefined;
    city: string | undefined;
    address: string | undefined;
    tel: string | undefined;
  }) => {
    try {
      const profileResponse = await $fetch<User>("/api/user/profile", {
        method: "PATCH",
        body: state,
      });

      if (user && user.value && profileResponse && profileResponse.id) {
        user.value.firstName = profileResponse.firstName;
        user.value.lastName = profileResponse.lastName;
        user.value.email = profileResponse.email;
        user.value.role = profileResponse.role;
        user.value.city = profileResponse.city;
        user.value.address = profileResponse.address;
        user.value.tel = profileResponse.tel;
      }

      toast.add({
        title: i18n.t("components.user.update.toasts.user-profile-updated"),
        color: "green",
        icon: "i-lucide-check-circle",
      });
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

  const changePassword = async (state: {
    oldPassword: string | undefined;
    password: string | undefined;
  }) => {
    try {
      await $fetch("/api/user/password", {
        method: "PATCH",
        body: state,
      });

      toast.add({
        title: i18n.t("pages.forgot-password.toasts.updated-password"),
        color: "green",
        icon: "i-lucide-check-circle",
      });

      await getUsers();
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
    users,
    getUsers,
    addUser,
    updateUser,
    verifyUser,
    deactivateUser,
    restoreUser,
    deleteUser,
    updateProfile,
    changePassword,
  };
};
