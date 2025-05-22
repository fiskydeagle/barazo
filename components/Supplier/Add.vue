<script setup lang="ts">
import { type InferType, object, string, mixed } from "yup";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
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

const formRef = ref();
const state = reactive({
  company: undefined,
  city: undefined,
  address: undefined,
  tel: undefined,
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
    if (!isOpen) {
      Object.assign(state, {
        company: undefined,
        city: undefined,
        address: undefined,
        tel: undefined,
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
              {{ i18n.t("components.supplier.add.add-supplier") }}
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
            :label="i18n.t('components.supplier.add.company')"
            name="company"
          >
            <UInput v-model="state.company" />
          </UFormGroup>

          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.add.city')"
            name="city"
          >
            <USelectMenu
              v-model="state.city"
              searchable
              :searchable-placeholder="
                i18n.t('components.supplier.add.search-city')
              "
              :placeholder="i18n.t('components.supplier.add.city')"
              :options="kosovoCities"
              value-attribute="code"
              option-attribute="name"
              :search-attributes="['name']"
            />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.add.address')"
            name="address"
          >
            <UTextarea v-model="state.address" autoresize />
          </UFormGroup>
          <UFormGroup
            size="lg"
            :label="i18n.t('components.supplier.add.tel')"
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
              {{ i18n.t("components.supplier.add.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.supplier.add.add") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
