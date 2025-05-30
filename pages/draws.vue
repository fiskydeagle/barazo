<script setup lang="ts">
import { format } from "date-fns";
import { useDraw } from "~/composables/useDraw";
import { type Draw } from "~/types";
import type {
  DatePickerDate,
  DatePickerRangeObject,
} from "v-calendar/dist/types/src/use/datePicker.d.ts";

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
    key: "totalNetAmount",
    label: i18n.t("pages.draws.totalNetAmount"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "plusMinus",
    label: i18n.t("pages.draws.plusMinus"),
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
    isVisible: false,
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
const dateRange = ref<DatePickerRangeObject>({
  start: null as DatePickerDate,
  end: null as DatePickerDate,
} as DatePickerRangeObject);

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
        dateDate: format(new Date(draw.date), "dd.MM.yyyy HH:mm"),
        cashAmount: draw.cashAmount,
        totalAmount: draw.totalAmount,
        totalNetAmount: draw.totalNetAmount,
        plusMinus: draw.plusMinus,
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
        order.totalAmount
          ?.toString()
          .includes(searchWord.value?.toLowerCase()) ||
        order.totalNetAmount
          ?.toString()
          .includes(searchWord.value?.toLowerCase()) ||
        order.plusMinus?.toString().includes(searchWord.value?.toLowerCase()) ||
        order.shop?.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
        order.comment
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.createdBy
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.updatedBy?.toLowerCase().includes(searchWord.value?.toLowerCase())
      );
    })
    .filter((order) => {
      if (!dateRange.value.start || !dateRange.value.end) return true;

      const orderDate = new Date(order.date).getTime();
      const startDate = new Date(dateRange.value.start.toString()).getTime();
      const endDate = new Date(dateRange.value.end.toString()).setHours(
        23,
        59,
        59,
      );

      return orderDate >= startDate && orderDate <= endDate;
    });
});

const allTotalAmount = computed(() => {
  if (!drawsRows.value || !drawsRows.value.length) return 0;

  return drawsRows.value.reduce((acc, row) => {
    return acc + (row.totalAmount || 0);
  }, 0);
});

const allTotalNetAmount = computed(() => {
  if (!drawsRows.value || !drawsRows.value.length) return 0;

  return drawsRows.value.reduce((acc, row) => {
    return acc + (row.totalNetAmount || 0);
  }, 0);
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
      <div class="flex flex-wrap justify-between items-end gap-2 mb-4">
        <div class="flex flex-wrap justify-between gap-2">
          <UFormGroup size="lg" :label="i18n.t('common.search')">
            <UInput v-model="searchWord" />
          </UFormGroup>

          <UFormGroup size="lg" :label="i18n.t('pages.draws.date')" name="date">
            <UPopover
              :popper="{ placement: 'bottom-start' }"
              class="[&>*]:block"
            >
              <UInput
                :model-value="
                  dateRange.start && dateRange.end
                    ? `${format(
                        new Date(dateRange.start.toString()),
                        'dd/MM/yyy',
                      )} - ${format(
                        new Date(dateRange.end.toString()),
                        'dd/MM/yyy',
                      )}`
                    : '-'
                "
                placeholder="DD/MM/YYYY HH:mm"
                autocomplete="off"
                @keydown="
                  (e: any) => {
                    if (e.which !== 9) e.preventDefault();
                  }
                "
                :ui="{ icon: { trailing: { pointer: '' } } }"
                class="min-w-[268px]"
              >
                <template #leading>
                  <UIcon
                    class="text-neutral-500 pointer-events-none text-xl"
                    name="fa6-regular:calendar-days"
                  />
                </template>

                <template v-if="dateRange.start && dateRange.end" #trailing>
                  <UButton
                    icon="i-heroicons-x-mark"
                    size="xs"
                    color="gray"
                    variant="ghost"
                    class="-mr-2"
                    @click.prevent="
                      dateRange = {
                        start: null as DatePickerDate,
                        end: null as DatePickerDate,
                      } as DatePickerRangeObject
                    "
                  />
                </template>
              </UInput>

              <template #panel>
                <InputsDatePicker
                  v-model="dateRange"
                  mode="date"
                  :is-range="true"
                  :max-date="new Date()"
                  is-required
                />
              </template>
            </UPopover>
          </UFormGroup>
        </div>

        <UButton size="lg" type="button" @click="addDrawAction">
          {{ i18n.t("pages.draws.add-draw") }}
        </UButton>
      </div>
      <ClientOnly>
        <div class="flex flex-col">
          <h4 class="text-lg">
            {{ i18n.t("pages.draws.total") }}:
            <span class="font-semibold">{{ allTotalAmount.toFixed(2) }}€</span>
          </h4>
          <h4 class="text-lg">
            {{ i18n.t("pages.draws.netTotal") }}:
            <span class="font-semibold"
              >{{ allTotalNetAmount.toFixed(2) }}€</span
            >
          </h4>
        </div>
      </ClientOnly>
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
          {{ row.totalAmount.toFixed(2) }}€
        </template>

        <template #totalNetAmount-data="{ row }">
          {{ row.totalNetAmount.toFixed(2) }}€
        </template>

        <template #plusMinus-data="{ row }">
          {{ row.plusMinus.toFixed(2) }}€
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
