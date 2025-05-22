<script setup>
import { useAuthUser } from "~/composables/useAuthUser";
import { UserRole } from "~/types";

const i18n = useI18n();

useHead(() => {
  return {
    title: "Barazo - " + i18n.t("page-titles.index"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.index"),
      },
    ],
  };
});

definePageMeta({
  middleware: "auth",
});

const { user } = useAuthUser();
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-4">{{ i18n.t("pages.index.home") }}</h1>
    <div class="flex justify-center">
      <div class="grid grid-cols-2 gap-4">
        <UButton
          v-if="[UserRole.SUPERADMIN, UserRole.ADMIN].includes(user.role)"
          icon="ph:users-three-duotone"
          size="xl"
          color="gray"
          :label="i18n.t('pages.index.add-user')"
          class="flex-col"
          :ui="{
            icon: {
              size: {
                xl: 'h-10 w-10',
              },
            },
          }"
          :to="{
            name: 'users',
            query: {
              modal: true,
            },
          }"
        />

        <UButton
          v-if="[UserRole.SUPERADMIN, UserRole.ADMIN].includes(user.role)"
          icon="ph:truck-duotone"
          size="xl"
          color="gray"
          :label="i18n.t('pages.index.add-supplier')"
          class="flex-col"
          :ui="{
            icon: {
              size: {
                xl: 'h-10 w-10',
              },
            },
          }"
          :to="{
            name: 'suppliers',
            query: {
              modal: true,
            },
          }"
        />
        <UButton
          icon="ph:money-wavy-duotone"
          size="xl"
          color="gray"
          :label="i18n.t('pages.index.add-purchase')"
          class="flex-col"
          :ui="{
            icon: {
              size: {
                xl: 'h-10 w-10',
              },
            },
          }"
          :to="{
            name: 'purchases',
            query: {
              modal: true,
            },
          }"
        />
      </div>
    </div>
  </div>
</template>
