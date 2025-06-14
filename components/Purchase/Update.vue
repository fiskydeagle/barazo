<script setup lang="ts">
import { type InferType, number, object, string } from "yup";
import { type Purchase, UserRole } from "~/types";
import type { FormSubmitEvent } from "#ui/types";
import { format } from "date-fns";

const i18n = useI18n();

type Props = {
  purchase: Purchase;
  isModalOpen: boolean;
  loading: boolean;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", purchase: typeof state): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const { user } = useAuthUser();
const { suppliers, getSuppliers } = useSupplier();
const { shops, getShops } = useShop();

const schema = object({
  amount: number()
    .transform((value, originalValue) => {
      return originalValue === "" ? null : value;
    })
    .required("Required")
    .moreThan(0, "Amount must be greater than 0"),
  date: string().when("amount", {
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
  supplier: string().required("Required"),
});

type Schema = InferType<typeof schema>;

const formRef = ref();
const state = reactive({
  id: props.purchase.id,
  date: props.purchase.date as string | undefined,
  dateObject: new Date(props.purchase.date),
  amount: props.purchase.amount,
  isDeclared: props.purchase.isDeclared,
  isOutside: props.purchase.isOutside,
  invoiceNumber: props.purchase.invoiceNumber,
  comment: props.purchase.comment,
  shopId: props.purchase.shopId,
  supplier: props.purchase.supplierName,
  supplierOption: "",
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  emits("onSubmit", {
    ...state,
    date: state.dateObject
      ? new Date(state.dateObject.toString()).toISOString()
      : undefined,
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
    if (isOpen) {
      getSuppliers(true);
      if (
        [UserRole.SUPERADMIN].includes(user.value?.role || ("" as UserRole))
      ) {
        getShops(true);
      }

      Object.assign(state, {
        id: props.purchase.id,
        date: props.purchase.date,
        dateObject: new Date(props.purchase.date),
        amount: props.purchase.amount,
        isDeclared: props.purchase.isDeclared,
        isOutside: props.purchase.isOutside,
        invoiceNumber: props.purchase.invoiceNumber,
        comment: props.purchase.comment,
        shopId: props.purchase.shopId,
        supplier: props.purchase.supplierName,
        supplierOption: "",
      });
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
              {{ i18n.t("components.purchase.update.update-purchase") }}
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
            :label="i18n.t('components.purchase.update.shop')"
            name="shopId"
          >
            <USelectMenu
              v-model="state.shopId"
              searchable
              :searchable-placeholder="
                i18n.t('components.purchase.update.search-shop')
              "
              :placeholder="i18n.t('components.purchase.update.shop')"
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
            :label="i18n.t('components.purchase.update.date')"
            name="date"
          >
            <UPopover
              :popper="{ placement: 'bottom-start' }"
              class="[&>*]:block"
            >
              <UInput
                :model-value="
                  state.date &&
                  format(
                    new Date(state.dateObject.toString()),
                    'dd/MM/yyy HH:mm',
                  )
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
                  v-model="state.dateObject"
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
            :label="i18n.t('components.purchase.update.supplier')"
            name="supplier"
          >
            <UInputMenu
              v-model:query="state.supplier"
              v-model="state.supplierOption"
              :options="
                suppliers && suppliers.length
                  ? suppliers.map((supplier) => supplier.company)
                  : []
              "
              :placeholder="i18n.t('components.purchase.update.search-shop')"
              class="w-full"
              @change="state.supplier = $event"
            >
              <template #option-empty="{ query }">
                <span class="text-gray-950">
                  {{ i18n.t("components.purchase.update.new-supplier") }}
                  <q class="font-medium">{{ query }}</q>
                </span>
              </template>
              <template #trailing>
                <button
                  type="button"
                  class="flex"
                  @click="
                    state.supplier = '';
                    state.supplierOption = '';
                  "
                >
                  <Icon
                    name="heroicons:chevron-down-20-solid"
                    size="20"
                    class="flex-shrink-0 text-gray-400 dark:text-gray-500"
                  />
                </button>
              </template>
            </UInputMenu>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.purchase.update.amount')"
            name="amount"
          >
            <UInput
              type="number"
              :min="0.01"
              :step="0.01"
              v-model="state.amount"
            />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.purchase.update.invoice-number')"
            name="invoiceNumber"
          >
            <UInput v-model="state.invoiceNumber" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.purchase.update.comment')"
            name="comment"
          >
            <UTextarea v-model="state.comment"></UTextarea>
          </UFormGroup>

          <div class="flex justify-between">
            <UFormGroup size="lg" name="isDeclared">
              <UCheckbox
                v-model="state.isDeclared"
                name="isDeclared"
                :label="i18n.t('components.purchase.update.is-declared')"
              />
            </UFormGroup>

            <UFormGroup size="lg" name="isOutside">
              <UCheckbox
                v-model="state.isOutside"
                name="isOutside"
                :label="i18n.t('components.purchase.update.is-outside')"
              />
            </UFormGroup>
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
              {{ i18n.t("components.purchase.update.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.purchase.update.update") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
