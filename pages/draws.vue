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
];

const searchWord = ref<string>();
const dateRange = ref<DatePickerRangeObject>({
  start: null as DatePickerDate,
  end: null as DatePickerDate,
} as DatePickerRangeObject);

const groupedDraws = computed(() => {
  if (!draws.value || !draws.value.length) return [];

  const map = new Map<string, Draw[]>();

  for (const draw of draws.value) {
    const date = new Date(draw.date).toISOString().split("T")[0];
    const shopId = draw.shopId;
    const key = `${date}_${shopId}`;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(draw);
  }

  return Array.from(map.entries()).map(([key, draws]) => {
    const [date, shopId] = key.split("_");
    return {
      date,
      shopId,
      draws,
    };
  });
});

const expand = ref({
  openedRows: [],
  row: {},
});

const drawsRows = computed(() => {
  return groupedDraws.value
    ?.map((group) => {
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
        date: new Date(group.date).getTime(),
        dateDate: format(new Date(group.date), "dd.MM.yyyy"),
        totalAmount: group.draws.reduce(
          (acc, draw) => acc + (draw.totalAmount || 0),
          0,
        ),
        totalNetAmount: group.draws.reduce(
          (acc, draw) => acc + (draw.totalNetAmount || 0),
          0,
        ),
        plusMinus: group.draws.reduce(
          (acc, draw) => acc + (draw.plusMinus || 0),
          0,
        ),
        shop: group.draws[0].shop?.name || "-",
        draws: group.draws,
        groupedActions: actions,
      };
    })
    .filter((group) => {
      if (!searchWord.value) return true;
      return (
        group.totalAmount
          ?.toString()
          .includes(searchWord.value?.toLowerCase()) ||
        group.totalNetAmount
          ?.toString()
          .includes(searchWord.value?.toLowerCase()) ||
        group.plusMinus?.toString().includes(searchWord.value?.toLowerCase()) ||
        group.shop?.toLowerCase().includes(searchWord.value?.toLowerCase())
      );
    })
    .filter((group) => {
      if (!dateRange.value.start || !dateRange.value.end) return true;

      const orderDate = new Date(group.date).getTime();
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
        v-model:expand="expand"
        :identifier="'data-table-draws'"
        :columns="columns"
        :rows="drawsRows"
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

        <template #expand="{ row }">
          <div class="py-4 flex max-md:flex-col items-start flex-wrap gap-4">
            <UCard v-for="draw in row.draws" :key="'draw-' + draw.id">
              <div class="flex gap-2">
                <div class="grow">
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.date") }}:</span
                    >
                    {{ format(new Date(draw.date), "dd.MM.yyyy HH:mm") }}
                  </p>
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.totalAmount") }}:</span
                    >
                    {{ draw.totalAmount.toFixed(2) }}€
                  </p>
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.totalNetAmount") }}:</span
                    >
                    {{ draw.totalNetAmount.toFixed(2) }}€
                  </p>
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.plusMinus") }}:</span
                    >
                    {{ draw.plusMinus.toFixed(2) }}€
                  </p>
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.shop") }}:</span
                    >
                    {{ draw.shop?.name || "-" }}
                  </p>
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.comment") }}:</span
                    >
                    {{ draw.comment || "-" }}
                  </p>
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.created-at") }}:</span
                    >
                    {{ format(new Date(draw.createdAt), "dd.MM.yyyy HH:mm") }}
                  </p>
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.updated-at") }}:</span
                    >
                    {{ format(new Date(draw.updatedAt), "dd.MM.yyyy HH:mm") }}
                  </p>
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.created-by") }}:</span
                    >
                    {{
                      draw.createdByUser
                        ? `${draw.createdByUser.firstName} ${draw.createdByUser.lastName}`
                        : "-"
                    }}
                  </p>
                  <p>
                    <span class="font-medium"
                      >{{ i18n.t("pages.draws.updated-by") }}:</span
                    >
                    {{
                      draw.updatedByUser
                        ? `${draw.updatedByUser.firstName} ${draw.updatedByUser.lastName}`
                        : "-"
                    }}
                  </p>
                </div>
                <div @click.stop="">
                  <ClientOnly
                    v-if="row.groupedActions && row.groupedActions.length"
                    fallback-tag="span"
                    fallback="Actions"
                  >
                    <UPopover
                      class="flex justify-end [&>*]:block [&>*]:w-auto"
                      :popper="{ placement: 'bottom-end' }"
                    >
                      <button
                        class="flex justify-center items-center rounded text-neutral-500 hover:text-neutral-700 -mr-3"
                      >
                        <Icon name="fe:elipsis-v" class="text-3xl -mx-1" />
                      </button>
                      <template #panel="{ close }">
                        <div
                          class="flex flex-col rounded-2xl shadow-shadow-lg px-3 py-2"
                        >
                          <button
                            v-for="groupedAction in row.groupedActions"
                            :key="
                              'action-btn-' +
                              draw.id +
                              '-' +
                              groupedAction.event
                            "
                            type="button"
                            class="py-2 pr-6 pl-0 body-1 text-left flex gap-2 group/action"
                            @click.prevent="
                              close();
                              action({ event: groupedAction.event, row: draw });
                            "
                          >
                            <Icon
                              :name="groupedAction.icon"
                              size="20"
                              class="block text-neutral-500 group-hover/action:text-neutral-700"
                            />
                            {{ groupedAction.label }}
                          </button>
                        </div>
                      </template>
                    </UPopover>
                  </ClientOnly>
                  <template v-else> &nbsp; </template>
                </div>
              </div>
            </UCard>
          </div>
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
