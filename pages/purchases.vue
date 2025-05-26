<script setup lang="ts">
import { format } from "date-fns";
import { usePurchase } from "~/composables/usePurchase";
import { type Purchase } from "~/types";
import type {
  DatePickerDate,
  DatePickerRangeObject,
} from "v-calendar/dist/types/src/use/datePicker.d.ts";

const i18n = useI18n();
const route = useRoute();

useHead(() => {
  return {
    title: "Barazo - " + i18n.t("page-titles.purchases"),
    meta: [
      {
        name: "description",
        content: i18n.t("page-titles.purchases"),
      },
    ],
  };
});

definePageMeta({
  middleware: ["auth", "verified"],
});

const {
  purchases,

  getPurchases,
  addPurchase,
  updatePurchase,
  deletePurchase,
} = usePurchase();
await getPurchases();

const columns = [
  {
    key: "id",
    label: i18n.t("pages.purchases.id"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "date",
    label: i18n.t("pages.purchases.date"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "amount",
    label: i18n.t("pages.purchases.amount"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "invoiceNumber",
    label: i18n.t("pages.purchases.invoice-number"),
    isVisible: true,
  },
  {
    key: "supplier",
    label: i18n.t("pages.purchases.supplier"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "shop",
    label: i18n.t("pages.purchases.shop"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "comment",
    label: i18n.t("pages.purchases.comment"),
    isVisible: false,
  },
  {
    key: "isDeclared",
    label: i18n.t("pages.purchases.is-declared"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "createdAt",
    label: i18n.t("pages.purchases.created-at"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "updatedAt",
    label: i18n.t("pages.purchases.updated-at"),
    isVisible: false,
    sortable: true,
  },
  {
    key: "createdBy",
    label: i18n.t("pages.purchases.created-by"),
    isVisible: true,
    sortable: true,
  },
  {
    key: "updatedBy",
    label: i18n.t("pages.purchases.updated-by"),
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

const purchasesRows = computed(() => {
  return purchases.value
    ?.map((purchase) => {
      const actions = [
        {
          event: "update",
          label: i18n.t("pages.purchases.update"),
          icon: "ph:pencil-duotone",
        },
      ];

      actions.push({
        event: "delete",
        label: i18n.t("pages.purchases.delete"),
        icon: "ph:trash-duotone",
      });

      return {
        id: purchase.id,
        date: new Date(purchase.date).getTime(),
        dateDate: format(new Date(purchase.date), "dd.MM.yyyy HH:mm"),
        amount: purchase.amount,
        isDeclared: purchase.isDeclared,
        invoiceNumber: purchase.invoiceNumber,
        comment: purchase.comment,
        shopId: purchase.shopId,
        shop: purchase.shop?.name || "-",
        supplierId: purchase.supplierId,
        supplier: purchase.supplier?.company || "-",
        supplierName: purchase.supplier?.company || undefined,
        createdAt: new Date(purchase.createdAt).getTime(),
        createdAtDate: format(new Date(purchase.createdAt), "dd.MM.yyyy"),
        updatedAt: new Date(purchase.updatedAt).getTime(),
        updatedAtDate: format(new Date(purchase.updatedAt), "dd.MM.yyyy"),
        createdBy: purchase.createdByUser
          ? `${purchase.createdByUser.firstName} ${purchase.createdByUser.lastName}`
          : "-",
        updatedBy: purchase.updatedByUser
          ? `${purchase.updatedByUser.firstName} ${purchase.updatedByUser.lastName}`
          : "-",
        actions,
      };
    })
    .filter((order) => {
      if (!searchWord.value) return true;
      return (
        order.amount?.toString().includes(searchWord.value?.toLowerCase()) ||
        order.invoiceNumber
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
        order.shop?.toLowerCase().includes(searchWord.value?.toLowerCase()) ||
        order.supplier
          ?.toLowerCase()
          .includes(searchWord.value?.toLowerCase()) ||
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

const allAmount = computed(() => {
  if (!purchasesRows.value || !purchasesRows.value.length) return 0;

  return purchasesRows.value.reduce((acc, row) => {
    return acc + (row.amount || 0);
  }, 0);
});

const purchaseAddModal = ref<boolean>(false);
const purchaseAddLoading = ref<boolean>(false);
const addPurchaseAction = () => {
  purchaseAddModal.value = true;
};

const onAddPurchase = async (state: any) => {
  purchaseAddLoading.value = true;

  if (await addPurchase(state)) {
    purchaseAddModal.value = false;
  }

  purchaseAddLoading.value = false;
};

const addPurchaseClose = () => {
  purchaseAddModal.value = false;
};

const purchaseToUpdate = ref<Purchase | null>(null);
const purchaseUpdateModal = ref<boolean>(false);
const purchaseUpdateLoading = ref<boolean>(false);
const updatePurchaseAction = (row: any) => {
  purchaseToUpdate.value = row;
  setTimeout(() => {
    purchaseUpdateModal.value = true;
  }, 100);
};
const onUpdatePurchase = async (state: any) => {
  purchaseUpdateLoading.value = true;

  if (await updatePurchase(state)) {
    purchaseUpdateModal.value = false;
    setTimeout(() => {
      purchaseToUpdate.value = null;
    }, 400);
  }

  purchaseUpdateLoading.value = false;
};
const updatePurchaseClose = () => {
  purchaseUpdateModal.value = false;
};

const action = async (event: { event: string; row: any }) => {
  switch (event.event) {
    case "update":
      updatePurchaseAction(event.row);
      break;
    case "delete":
      await deletePurchase(event.row.id);
      break;
  }
};

onMounted(() => {
  if (route.query.modal) {
    addPurchaseAction();
  }
});
</script>

<template>
  <div>
    <h1 class="text-3xl text-center mb-6">
      {{ i18n.t("pages.purchases.purchases") }}
    </h1>
    <div class="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap justify-between items-end gap-2 mb-4">
        <div class="flex flex-wrap justify-between gap-2">
          <UFormGroup size="lg" :label="i18n.t('common.search')">
            <UInput v-model="searchWord" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('pages.purchases.date')"
            name="date"
          >
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

        <UButton size="lg" type="button" @click="addPurchaseAction">
          {{ i18n.t("pages.purchases.add-purchase") }}
        </UButton>
      </div>
      <ClientOnly>
        <div class="flex flex-col">
          <h4 class="text-lg">
            {{ i18n.t("pages.purchases.total") }}:
            <span class="font-semibold">{{ allAmount.toFixed(2) }}€</span>
          </h4>
        </div>
      </ClientOnly>
    </div>

    <ClientOnly>
      <DataTable
        :dynamic-columns="true"
        :identifier="'data-table-purchases'"
        :columns="columns"
        :rows="purchasesRows"
        @on-action-click="action"
        @select="action({ event: 'update', row: $event })"
      >
        <template #date-data="{ row }">
          {{ row.dateDate }}
        </template>

        <template #amount-data="{ row }"> {{ row.amount }}€ </template>

        <template #isDeclared-data="{ row }">
          <div class="flex justify-center">
            <ClientOnly>
              <UCheckbox
                disabled
                :model-value="row.isDeclared"
                name="isDeclaredList"
                :ui="{
                  base: '!cursor-default !opacity-100',
                }"
              />
            </ClientOnly>
          </div>
        </template>

        <template #invoiceNumber-data="{ row }">
          {{ row.invoiceNumber || "-" }}
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

    <PurchaseAdd
      :is-modal-open="purchaseAddModal"
      :loading="purchaseAddLoading"
      @on-close="addPurchaseClose"
      @on-submit="onAddPurchase"
    />

    <PurchaseUpdate
      v-if="purchaseToUpdate"
      :purchase="purchaseToUpdate"
      :is-modal-open="purchaseUpdateModal"
      :loading="purchaseUpdateLoading"
      @on-close="updatePurchaseClose"
      @on-submit="onUpdatePurchase"
    />
  </div>
</template>
