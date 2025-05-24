<script setup lang="ts">
import { type InferType, number, object, string } from "yup";
import { type Draw, UserRole } from "~/types";
import type { FormSubmitEvent } from "#ui/types";
import { format } from "date-fns";

const i18n = useI18n();

type Props = {
  draw: Draw;
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
  id: props.draw.id,
  date: props.draw.date as string | undefined,
  dateObject: new Date(props.draw.date),
  cashAmount: props.draw.cashAmount,
  systemAmount: props.draw.systemAmount,
  comment: props.draw.comment,
  shopId: props.draw.shopId,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  emits("onSubmit", {
    ...state,
    date: state.dateObject
      ? format(new Date(state.dateObject.toString()), "yyyy-MM-dd")
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
      if (
        [UserRole.SUPERADMIN].includes(user.value?.role || ("" as UserRole))
      ) {
        getShops(true);
      }

      Object.assign(state, {
        id: props.draw.id,
        date: props.draw.date,
        dateObject: new Date(props.draw.date),
        cashAmount: props.draw.cashAmount,
        systemAmount: props.draw.systemAmount,
        comment: props.draw.comment,
        shopId: props.draw.shopId,
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
              {{ i18n.t("components.draw.update.update-draw") }}
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
            :label="i18n.t('components.draw.update.shop')"
            name="shopId"
          >
            <USelectMenu
              v-model="state.shopId"
              searchable
              :searchable-placeholder="
                i18n.t('components.draw.update.search-shop')
              "
              :placeholder="i18n.t('components.draw.update.shop')"
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
            :label="i18n.t('components.draw.update.date')"
            name="date"
          >
            <UPopover
              :popper="{ placement: 'bottom-start' }"
              class="[&>*]:block"
            >
              <UInput
                :model-value="
                  state.date &&
                  format(new Date(state.dateObject.toString()), 'dd/MM/yyy')
                "
                placeholder="DD/MM/YYYY"
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
                  mode="date"
                  :max-date="new Date()"
                  is-required
                  @close="dateValidation()"
                />
              </template>
            </UPopover>
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.draw.update.cashAmount')"
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
            :label="i18n.t('components.draw.update.systemAmount')"
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
            :label="i18n.t('components.draw.update.comment')"
            name="comment"
          >
            <UTextarea v-model="state.comment"></UTextarea>
          </UFormGroup>
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
              {{ i18n.t("components.draw.update.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.draw.update.update") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
