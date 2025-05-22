<script setup lang="ts">
import { type InferType, object, string, mixed } from "yup";
import { type Supplier } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
  supplier: Supplier;
  isModalOpen: boolean;
  loading: boolean;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", supplier: typeof state): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const { kosovoCities } = useUtils();

const schema = object({
  company: string().required("Required"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  id: props.supplier.id,
  company: props.supplier.company,
  city: props.supplier.city,
  address: props.supplier.address,
  tel: props.supplier.tel,
});

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  emits("onSubmit", state);
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
      Object.assign(state, {
        id: props.supplier.id,
        company: props.supplier.company,
        city: props.supplier.city,
        address: props.supplier.address,
        tel: props.supplier.tel,
      });
    }
  },
);
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-md',
    }"
  >
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
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
              {{ i18n.t("components.supplier.update.update-supplier") }}
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
            size="lg"
            :label="i18n.t('components.supplier.update.company')"
            name="company"
          >
            <UInput v-model="state.company" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.update.city')"
            name="city"
          >
            <USelectMenu
              v-model="state.city"
              searchable
              :searchable-placeholder="
                i18n.t('components.supplier.update.search-city')
              "
              :placeholder="i18n.t('components.supplier.update.city')"
              :options="kosovoCities"
              value-attribute="code"
              option-attribute="name"
              :search-attributes="['name']"
            />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.update.address')"
            name="address"
          >
            <UTextarea v-model="state.address" autoresize />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.update.tel')"
            name="tel"
          >
            <UInput v-model="state.tel" />
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
              {{ i18n.t("components.supplier.update.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.supplier.update.update") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
