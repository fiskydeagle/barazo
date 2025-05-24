<script setup lang="ts">
import { format } from "date-fns";
import { useDraw } from "~/composables/useDraw";
import { type Draw } from "~/types";

const i18n = useI18n();
const route = useRoute();

useHead(() => {
  return {
    title: "Barazo - " + i18n.t("page-titles.draws"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.draws"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "verified"],
});

const {
  draws,

  getDraws,
  addDraw,
  updateDraw,
  deleteDraw,
} = useDraw();
await getDraws();

const columns = [
  {
    key: "id",
    label: i18n.t("pages.draws.id"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "date",
    label: i18n.t("pages.draws.date"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "totalAmount",
    label: i18n.t("pages.draws.totalAmount"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "shop",
    label: i18n.t("pages.draws.shop"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "comment",
    label: i18n.t("pages.draws.comment"),
    isVisible: true,
  },
  {
    key: "createdAt",
    label: i18n.t("pages.draws.created-at"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "updatedAt",
    label: i18n.t("pages.draws.updated-at"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "createdBy",
    label: i18n.t("pages.draws.created-by"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "updatedBy",
    label: i18n.t("pages.draws.updated-by"),
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

const drawsRows = computed(() => {
  return draws.value
    ?.map((draw) => {
      const actions = [
        {
          event: "update",
          label: i18n.t("pages.draws.update"),
          icon: "ph:pencil-duotone",
        },
      ];

      actions.push({
        event: "delete",
        label: i18n.t("pages.draws.delete"),
        icon: "ph:trash-duotone",
      });

      return {
        id: draw.id,
        date: new Date(draw.date).getTime(),
        dateDate: format(new Date(draw.date), "dd.MM.yyyy"),
        cashAmount: draw.cashAmount,
        totalAmount: draw.totalAmount,
        systemAmount: draw.systemAmount,
        comment: draw.comment,
        shopId: draw.shopId,
        shop: draw.shop?.name || "-",
        createdAt: new Date(draw.createdAt).getTime(),
        createdAtDate: format(new Date(draw.createdAt), "dd.MM.yyyy"),
        updatedAt: new Date(draw.updatedAt).getTime(),
        updatedAtDate: format(new Date(draw.updatedAt), "dd.MM.yyyy"),
        createdBy: draw.createdByUser
          ? `${draw.createdByUser.firstName} ${draw.createdByUser.lastName}`
          : "-",
        updatedBy: draw.updatedByUser
          ? `${draw.updatedByUser.firstName} ${draw.updatedByUser.lastName}`
          : "-",
        actions,
      };
    })
    .filter((order) => {
      if (!searchWord.value) return true;
      return (
        order.dateDate
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.totalAmount
          ?.toString()
          .includes(searchWord.value?.toLowerCase()) ||
        order.shop?.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
        order.comment
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
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

const drawAddModal = ref<boolean>(false);
const drawAddLoading = ref<boolean>(false);
const addDrawAction = () => {
  drawAddModal.value = true;
};

const onAddDraw = async (state: any) => {
  drawAddLoading.value = true;

  if (await addDraw(state)) {
    drawAddModal.value = false;
  }

  drawAddLoading.value = false;
};

const addDrawClose = () => {
  drawAddModal.value = false;
};

const drawToUpdate = ref<Draw | null>(null);
const drawUpdateModal = ref<boolean>(false);
const drawUpdateLoading = ref<boolean>(false);
const updateDrawAction = (row: any) => {
  drawToUpdate.value = row;
  setTimeout(() => {
    drawUpdateModal.value = true;
  }, 100);
};
const onUpdateDraw = async (state: any) => {
  drawUpdateLoading.value = true;

  if (await updateDraw(state)) {
    drawUpdateModal.value = false;
    setTimeout(() => {
      drawToUpdate.value = null;
    }, 400);
  }

  drawUpdateLoading.value = false;
};
const updateDrawClose = () => {
  drawUpdateModal.value = false;
};

const action = async (event: { event: string; row: any }) => {
  switch (event.event) {
    case "update":
      updateDrawAction(event.row);
      break;
    case "delete":
      await deleteDraw(event.row.id);
      break;
  }
};

onMounted(() => {
  if (route.query.modal) {
    addDrawAction();
  }
});
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">
      {{ i18n.t("pages.draws.draws") }}
    </h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap justify-between items-end gap-2">
        <UFormGroup size="lg" :label="i18n.t('common.search')">
          <UInput v-model="searchWord" />
        </UFormGroup>

        <UButton size="lg" type="button" @click="addDrawAction">
          {{ i18n.t("pages.draws.add-draw") }}
        </UButton>
      </div>
    </div>

    <ClientOnly>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-draws'"
        :columns="columns"
        :rows="drawsRows"
        @on-action-click="action"
        @select="action({ event: 'update', row: $event })"
      >
        <template #date-data="{ row }">
          {{ row.dateDate }}
        </template>

        <template #totalAmount-data="{ row }">
          {{ row.totalAmount }}€
        </template>

        <template #comment-data="{ row }">
          <div class="whitespace-normal text-left">
            {{ row.comment || "-" }}
          </div>
        </template>

        <template #createdAt-data="{ row }">
          {{ row.createdAtDate }}
        </template>

        <template #updatedAt-data="{ row }">
          {{ row.updatedAtDate }}
        </template>
      </DataTable>
    </ClientOnly>

    <DrawAdd
      :is-modal-open="drawAddModal"
      :loading="drawAddLoading"
      @on-close="addDrawClose"
      @on-submit="onAddDraw"
    />

    <DrawUpdate
      v-if="drawToUpdate"
      :draw="drawToUpdate"
      :is-modal-open="drawUpdateModal"
      :loading="drawUpdateLoading"
      @on-close="updateDrawClose"
      @on-submit="onUpdateDraw"
    />
  </div>
</template>
