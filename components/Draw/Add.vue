<script setup lang="ts">
import { type InferType, number, object, string } from "yup";
import type { FormSubmitEvent } from "#ui/types";
import { UserRole } from "~/types";
import { format } from "date-fns";

const i18n = useI18n();

type Props = {
  isModalOpen: boolean;
  loading: boolean;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", draw: typeof state): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const { user } = useAuthUser();
const { shops, getShops } = useShop();
const { infos, getInfos } = useDraw();

const drawColumns = [
  {
    key: "date",
    label: i18n.t("pages.draws.date"),
  },
  {
    key: "comment",
    label: i18n.t("pages.draws.comment"),
  },
  {
    key: "cashAmount",
    label: i18n.t("pages.draws.cashAmount"),
  },
  {
    key: "systemAmount",
    label: i18n.t("pages.draws.systemAmount"),
  },
  {
    key: "createdBy",
    label: i18n.t("pages.draws.created-by"),
  },
];

const purchaseColumns = [
  {
    key: "date",
    label: i18n.t("pages.purchases.date"),
  },
  {
    key: "comment",
    label: i18n.t("pages.purchases.comment"),
  },
  {
    key: "amount",
    label: i18n.t("pages.purchases.amount"),
  },
  {
    key: "createdBy",
    label: i18n.t("pages.purchases.created-by"),
  },
];

const currentDraws = computed(() => {
  if (!infos.value?.draws || !infos.value?.draws.length) return [];

  return infos.value?.draws.filter((draw) => {
    const drawDate = new Date(draw.date).getTime();
    return !state.date || drawDate < new Date(state.date.toString()).getTime();
  });
});

const currentPurchases = computed(() => {
  if (!infos.value?.purchases || !infos.value?.purchases.length) return [];

  const lastDraw =
    infos.value?.draws && infos.value?.draws.length
      ? infos.value?.draws.find(
          (draw) =>
            !state.date ||
            new Date(draw.date).getTime() <
              new Date(state.date.toString()).getTime(),
        )
      : undefined;

  const lastDrawDate = lastDraw ? new Date(lastDraw.date).getTime() : undefined;

  return infos.value?.purchases.filter((purchase) => {
    const currentPurchaseDate = new Date(purchase.date).getTime();

    return (
      (!lastDrawDate || currentPurchaseDate > lastDrawDate) &&
      (!state.date ||
        currentPurchaseDate <= new Date(state.date.toString()).getTime())
    );
  });
});

const totalCurrentPurchase = computed(() => {
  return currentPurchases.value.reduce((acc, purchase) => {
    return acc + (purchase.amount || 0);
  }, 0);
});

const lastCashAmount = computed(() => {
  return infos.value?.draws && infos.value?.draws.length
    ? infos.value?.draws.find(
        (draw) =>
          !state.date ||
          new Date(draw.date).getTime() <
            new Date(state.date.toString()).getTime(),
      )?.cashAmount || 0
    : 0;
});

const lastSystemAmount = computed(() => {
  return infos.value?.draws && infos.value?.draws.length
    ? infos.value?.draws.find(
        (draw) =>
          !state.date ||
          new Date(draw.date).getTime() <
            new Date(state.date.toString()).getTime(),
      )?.systemAmount || 0
    : 0;
});

const schema = object({
  cashAmount: number()
    .transform((value, originalValue) => {
      return originalValue === "" ? null : value;
    })
    .required("Required")
    .moreThan(-1, "Amount must be greater or equal to 0"),
  systemAmount: number()
    .transform((value, originalValue) => {
      return originalValue === "" ? null : value;
    })
    .required("Required")
    .moreThan(-1, "Amount must be greater or equal to 0"),
  date: string().when("cashAmount", {
    is: () =>
      [UserRole.SUPERADMIN, UserRole.ADMIN].includes(
        user.value?.role || UserRole.ADMIN,
      ),
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  shopId: number().when("amount", {
    is: () =>
      [UserRole.SUPERADMIN].includes(user.value?.role || ("" as UserRole)),
    then: (schema) => schema.required("Required").notOneOf([0], "Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  comment: string().required("Required"),
});

type Schema = InferType<typeof schema>;

const formRef = ref();
const state = reactive({
  date: undefined as string | undefined,
  cashAmount: undefined,
  totalAmount: undefined as number | undefined,
  plusMinus: undefined as number | undefined,
  systemAmount: undefined,
  comment: undefined,
  shopId: user.value?.shopId || undefined,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  emits("onSubmit", {
    ...state,
    date: state.date
      ? format(new Date(state.date.toString()), "yyyy-MM-dd HH:mm")
      : undefined,
    totalAmount: (state.cashAmount || 0) - lastCashAmount.value,
    plusMinus:
      totalCurrentPurchase.value +
      (state.cashAmount || 0) -
      lastCashAmount.value -
      ((state.systemAmount || 0) - lastSystemAmount.value),
  });
};

const isOpen = computed({
  get: () => props.isModalOpen,
  set: (value) => {
    if (!value) emits("onClose");
  },
});

watch(
  () => isOpen.value,
  (isOpen) => {
    if (!isOpen) {
      Object.assign(state, {
        date: undefined,
        cashAmount: undefined,
        totalAmount: undefined,
        plusMinus: undefined,
        systemAmount: undefined,
        comment: undefined,
        shopId: user.value?.shopId || undefined,
      });

      infos.value = {
        purchases: [],
        draws: [],
      };
    } else {
      // @ts-ignore
      state.date = new Date();

      if (user.value?.shopId) {
        getInfos(user.value?.shopId.toString());
      }

      if (
        [UserRole.SUPERADMIN].includes(user.value?.role || ("" as UserRole))
      ) {
        getShops(true);
      }
    }
  },
);

watch(
  () => state.shopId,
  (shopId) => {
    if (shopId && state.date) {
      getInfos(
        shopId.toString(),
        state.date
          ? format(new Date(state.date.toString()), "yyyy-MM-dd HH:mm")
          : undefined,
      );
    }
  },
);

watch(
  () => state.date,
  (date) => {
    if (state.shopId && date) {
      getInfos(
        state.shopId.toString(),
        date
          ? format(new Date(date.toString()), "yyyy-MM-dd HH:mm")
          : undefined,
      );
    }
  },
);

const dateValidation = async () => {
  await formRef.value?.validate("date", { silent: true });
};
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-md',
    }"
  >
    <UForm
      ref="formRef"
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div
            class="flex justify-between items-center text-lg font-normal leading-6"
          >
            <h6 class="text-xl">
              {{ i18n.t("components.draw.add.add-draw") }}
            </h6>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1 text-neutral-500"
              @click="isOpen = false"
            />
          </div>
        </template>

        <div class="flex flex-col gap-4">
          <UFormGroup
            v-if="
              [UserRole.SUPERADMIN].includes(user?.role || ('' as UserRole))
            "
            size="lg"
            :label="i18n.t('components.draw.add.shop')"
            name="shopId"
          >
            <USelectMenu
              v-model="state.shopId"
              searchable
              :searchable-placeholder="
                i18n.t('components.draw.add.search-shop')
              "
              :placeholder="i18n.t('components.draw.add.shop')"
              :options="shops"
              value-attribute="id"
              option-attribute="name"
              :search-attributes="['name']"
            />
          </UFormGroup>

          <UFormGroup
            v-if="
              [UserRole.SUPERADMIN, UserRole.ADMIN].includes(
                user?.role || UserRole.ADMIN,
              )
            "
            size="lg"
            :label="i18n.t('components.draw.add.date')"
            name="date"
          >
            <UPopover
              :popper="{ placement: 'bottom-start' }"
              class="[&>*]:block"
            >
              <UInput
                :model-value="
                  state.date &&
                  format(new Date(state.date.toString()), 'dd/MM/yyy HH:mm')
                "
                placeholder="DD/MM/YYYY HH:mm"
                autocomplete="off"
                @keydown="
                  (e: any) => {
                    if (e.which !== 9) e.preventDefault();
                  }
                "
              >
                <template #leading>
                  <UIcon
                    class="text-neutral-500 pointer-events-none text-xl"
                    name="fa6-regular:calendar-days"
                  />
                </template>
              </UInput>

              <template #panel>
                <InputsDatePicker
                  v-model="state.date"
                  mode="datetime"
                  :max-date="new Date()"
                  is-required
                  @close="dateValidation()"
                />
              </template>
            </UPopover>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.draw.add.totalPurchase')"
            name="totalCurrentPurchase"
          >
            <p>{{ totalCurrentPurchase.toFixed(2) }}€</p>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.draw.add.cashAmount')"
            name="cashAmount"
          >
            <UInput
              type="number"
              :min="0.01"
              :step="0.01"
              v-model="state.cashAmount"
            />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.draw.add.totalAmount')"
            name="totalAmount"
          >
            <p>
              {{
                state.cashAmount
                  ? (
                      totalCurrentPurchase +
                      state.cashAmount -
                      lastCashAmount
                    ).toFixed(2)
                  : "0.00"
              }}€
            </p>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.draw.add.systemAmount')"
            name="systemAmount"
          >
            <UInput
              type="number"
              :min="0.01"
              :step="0.01"
              v-model="state.systemAmount"
            />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.draw.add.result')"
            name="result"
          >
            <p>
              {{
                state.cashAmount && state.systemAmount
                  ? (state.systemAmount - lastSystemAmount).toFixed(2)
                  : "0.00"
              }}€
            </p>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.draw.add.plus-minus')"
            name="plusMinus"
          >
            <p>
              {{
                state.cashAmount && state.systemAmount
                  ? (
                      totalCurrentPurchase +
                      state.cashAmount -
                      lastCashAmount -
                      (state.systemAmount - lastSystemAmount)
                    ).toFixed(2)
                  : "0.00"
              }}€
            </p>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.draw.add.comment')"
            name="comment"
          >
            <UTextarea v-model="state.comment"></UTextarea>
          </UFormGroup>

          <div v-if="currentDraws.length" class="mb-4">
            <h2 class="border-b border-neutral-300 text-lg font-semibold pb-2">
              {{ i18n.t("pages.draws.draws") }}
            </h2>
            <UTable :columns="drawColumns" :rows="currentDraws">
              <template #date-data="{ row }">
                {{ format(new Date(row.date), "dd.MM.yyyy HH:mm") }}
              </template>
              <template #createdBy-data="{ row }">
                {{
                  row.createdByUser
                    ? `${row.createdByUser.firstName} ${row.createdByUser.lastName}`
                    : "-"
                }}
              </template>
              <template #cashAmount-data="{ row }">
                {{ row.cashAmount.toFixed(2) }}€
              </template>
              <template #systemAmount-data="{ row }">
                {{ row.systemAmount.toFixed(2) }}€
              </template>
            </UTable>
          </div>

          <div v-if="currentPurchases.length">
            <h2 class="border-b border-neutral-300 text-lg font-semibold pb-2">
              {{ i18n.t("pages.purchases.purchases") }}
            </h2>
            <UTable :columns="purchaseColumns" :rows="currentPurchases">
              <template #date-data="{ row }">
                {{ format(new Date(row.date), "dd.MM.yyyy HH:mm") }}
              </template>
              <template #createdBy-data="{ row }">
                {{
                  row.createdByUser
                    ? `${row.createdByUser.firstName} ${row.createdByUser.lastName}`
                    : "-"
                }}
              </template>
              <template #amount-data="{ row }">
                {{ row.amount.toFixed(2) }}€
              </template>
            </UTable>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <UButton
              type="button"
              size="lg"
              color="gray"
              variant="ghost"
              @click="isOpen = false"
            >
              {{ i18n.t("components.draw.add.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.draw.add.add") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
