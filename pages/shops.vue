<script setup lang="ts">
import { format } from "date-fns";
import { useShop } from "~/composables/useShop";
import { type Shop } from "~/types";

const i18n = useI18n();
const route = useRoute();

useHead(() => {
  return {
    title: "Barazo - " + i18n.t("page-titles.shops"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.shops"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "verified", "superadmin"],
});

const {
  shops,

  getShops,
  addShop,
  updateShop,
  deactivateShop,
  restoreShop,
  deleteShop,
} = useShop();
await getShops();

const columns = [
  {
    key: "id",
    label: i18n.t("pages.shops.id"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "name",
    label: i18n.t("pages.shops.name"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "createdAt",
    label: i18n.t("pages.shops.created-at"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "updatedAt",
    label: i18n.t("pages.shops.updated-at"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "createdBy",
    label: i18n.t("pages.shops.created-by"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "updatedBy",
    label: i18n.t("pages.shops.updated-by"),
    isVisible: false,
    sortable: true,
  },
  {
    label: "",
    key: "actions",
    class: "w-1",
    isVisible: true,
  },
];

const searchWord = ref<string>();

const shopsRows = computed(() => {
  return shops.value
    ?.map((shop) => {
      const actions = [
        {
          event: "update",
          label: i18n.t("pages.shops.update"),
          icon: "ph:pencil-duotone",
        },
      ];

      if (!shop.deletedAt) {
        actions.push({
          event: "deactivate",
          label: i18n.t("pages.shops.deactivate"),
          icon: "ph:eye-slash-duotone",
        });
      } else {
        actions.push({
          event: "restore",
          label: i18n.t("pages.shops.restore"),
          icon: "ph:eye-duotone",
        });
      }

      actions.push({
        event: "delete",
        label: i18n.t("pages.shops.delete"),
        icon: "ph:trash-duotone",
      });

      const cssClass = shop.deletedAt ? "!bg-red-500 !bg-opacity-20" : "";

      return {
        id: shop.id,
        name: shop.name,
        createdAt: new Date(shop.createdAt).getTime(),
        createdAtDate: format(new Date(shop.createdAt), "dd.MM.yyyy"),
        updatedAt: new Date(shop.updatedAt).getTime(),
        updatedAtDate: format(new Date(shop.updatedAt), "dd.MM.yyyy"),
        createdBy: shop.createdByUser
          ? `${shop.createdByUser.firstName} ${shop.createdByUser.lastName}`
          : "-",
        updatedBy: shop.updatedByUser
          ? `${shop.updatedByUser.firstName} ${shop.updatedByUser.lastName}`
          : "-",
        deletedAt: shop.deletedAt,
        class: cssClass,
        actions,
      };
    })
    .filter((order) => {
      if (!searchWord.value) return true;
      return (
        order.name?.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
        order.createdAtDate
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.updatedAtDate
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.createdBy
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.updatedBy?.toLowerCase().includes(searchWord.value?.toLowerCase())
      );
    });
});

const shopAddModal = ref<boolean>(false);
const shopAddLoading = ref<boolean>(false);
const addShopAction = () => {
  shopAddModal.value = true;
};

const onAddShop = async (state: any) => {
  shopAddLoading.value = true;

  if (await addShop(state)) {
    shopAddModal.value = false;
  }

  shopAddLoading.value = false;
};

const addShopClose = () => {
  shopAddModal.value = false;
};

const shopToUpdate = ref<Shop | null>(null);
const shopUpdateModal = ref<boolean>(false);
const shopUpdateLoading = ref<boolean>(false);
const updateShopAction = (row: any) => {
  shopToUpdate.value = row;
  setTimeout(() => {
    shopUpdateModal.value = true;
  }, 100);
};
const onUpdateShop = async (state: any) => {
  shopUpdateLoading.value = true;

  if (await updateShop(state)) {
    shopUpdateModal.value = false;
    setTimeout(() => {
      shopToUpdate.value = null;
    }, 400);
  }

  shopUpdateLoading.value = false;
};
const updateShopClose = () => {
  shopUpdateModal.value = false;
};

const action = async (event: { event: string; row: any }) => {
  switch (event.event) {
    case "update":
      updateShopAction(event.row);
      break;
    case "deactivate":
      await deactivateShop(event.row.id);
      break;
    case "restore":
      await restoreShop(event.row.id);
      break;
    case "delete":
      await deleteShop(event.row.id);
      break;
  }
};

onMounted(() => {
  if (route.query.modal) {
    addShopAction();
  }
});
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">
      {{ i18n.t("pages.shops.shops") }}
    </h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap justify-between items-end gap-2">
        <UFormGroup size="lg" :label="i18n.t('common.search')">
          <UInput v-model="searchWord" />
        </UFormGroup>

        <UButton size="lg" type="button" @click="addShopAction">
          {{ i18n.t("pages.shops.add-shop") }}
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-shops'"
        :columns="columns"
        :rows="shopsRows"
        @on-action-click="action"
        @select="action({ event: 'update', row: $event })"
      >
        <template #createdAt-data="{ row }">
          {{ row.createdAtDate }}
        </template>

        <template #updatedAt-data="{ row }">
          {{ row.updatedAtDate }}
        </template>
      </DataTable>
    </ClientOnly>

    <ShopAdd
      :is-modal-open="shopAddModal"
      :loading="shopAddLoading"
      @on-close="addShopClose"
      @on-submit="onAddShop"
    />

    <ShopUpdate
      v-if="shopToUpdate"
      :shop="shopToUpdate"
      :is-modal-open="shopUpdateModal"
      :loading="shopUpdateLoading"
      @on-close="updateShopClose"
      @on-submit="onUpdateShop"
    />
  </div>
</template>
