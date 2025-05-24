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
  systemAmount: undefined,
  comment: undefined,
  shopId: undefined,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  emits("onSubmit", {
    ...state,
    date: state.date
      ? format(new Date(state.date.toString()), "yyyy-MM-dd")
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
    if (!isOpen) {
      Object.assign(state, {
        date: undefined,
        cashAmount: undefined,
        systemAmount: undefined,
        comment: undefined,
        shopId: undefined,
      });
    } else {
      if (
        [UserRole.SUPERADMIN].includes(user.value?.role || ("" as UserRole))
      ) {
        getShops(true);
      }
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
                  format(new Date(state.date.toString()), 'dd/MM/yyy')
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
                  v-model="state.date"
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
            :label="i18n.t('components.draw.add.comment')"
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
