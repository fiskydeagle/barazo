<script setup lang="ts">
import { type InferType, number, object, string } from "yup";
import { type User, UserRole } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
  user: User;
  isModalOpen: boolean;
  loading: boolean;
};

type EmitType = {
  (event: "onClose"): void;
  (event: "onSubmit", user: typeof state): void;
};

const props = defineProps<Props>();
const emits = defineEmits<EmitType>();

const { user } = useAuthUser();
const { shops, getShops } = useShop();
const { kosovoCities } = useUtils();

const schema = object({
  firstName: string().required("Required"),
  lastName: string().required("Required"),
  role: string().required("Required"),
  shopId: number().when("role", {
    is: (role: UserRole) =>
      role !== UserRole.SUPERADMIN && user.value?.role === UserRole.SUPERADMIN,
    then: (schema) => schema.required("Required").notOneOf([0], "Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  city: string().required("Required"),
  address: string().required("Required"),
});

type Schema = InferType<typeof schema>;

const formRef = ref();

const state = reactive({
  id: props.user.id,
  firstName: props.user.firstName,
  lastName: props.user.lastName,
  role: props.user.role || 0,
  shopId: props.user.shopId,
  city: props.user.city || "vu",
  address: props.user.address,
  tel: props.user.tel,
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
  () => state.role,
  (role) => {
    if (role === UserRole.SUPERADMIN) {
      state.shopId = 0;
    }
  },
);

watch(
  () => isOpen.value,
  (isOpen) => {
    if (isOpen) {
      getShops();
      Object.assign(state, {
        id: props.user.id,
        firstName: props.user.firstName,
        lastName: props.user.lastName,
        role: props.user.role,
        shopId: props.user.shopId,
        city: props.user.city || "vu",
        address: props.user.address,
        tel: props.user.tel,
      });
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-3xl',
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
              {{ i18n.t("components.user.update.update-user") }}
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

        <div class="flex max-sm:flex-col gap-4 w-full">
          <div class="w-full flex flex-col gap-4">
            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.role')"
              name="role"
            >
              <USelectMenu
                v-model="state.role"
                :options="[
                  ...(user?.role === UserRole.SUPERADMIN
                    ? [
                        {
                          id: UserRole.SUPERADMIN,
                          label: i18n.t('components.user.add.superadmin'),
                        },
                      ]
                    : []),
                  {
                    id: UserRole.ADMIN,
                    label: i18n.t('components.user.add.admin'),
                  },
                  {
                    id: UserRole.EMPLOYEE,
                    label: i18n.t('components.user.add.employee'),
                  },
                ]"
                value-attribute="id"
                placeholder="Role"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.first-name')"
              name="firstName"
            >
              <UInput v-model="state.firstName" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.last-name')"
              name="lastName"
            >
              <UInput v-model="state.lastName" />
            </UFormGroup>
          </div>
          <div class="w-full flex flex-col gap-4">
            <UFormGroup
              v-if="
                state.role !== UserRole.SUPERADMIN &&
                user?.role === UserRole.SUPERADMIN
              "
              size="lg"
              :label="i18n.t('components.user.update.shop')"
              name="shopId"
            >
              <USelectMenu
                v-model="state.shopId"
                searchable
                :searchable-placeholder="
                  i18n.t('components.user.update.search-shop')
                "
                :placeholder="i18n.t('components.user.update.shop')"
                :options="shops"
                value-attribute="id"
                option-attribute="name"
                :search-attributes="['name']"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.city')"
              name="city"
            >
              <USelectMenu
                v-model="state.city"
                searchable
                :searchable-placeholder="
                  i18n.t('components.user.update.search-city')
                "
                :placeholder="i18n.t('components.user.update.city')"
                :options="kosovoCities"
                value-attribute="code"
                option-attribute="name"
                :search-attributes="['name']"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.address')"
              name="address"
            >
              <UTextarea v-model="state.address" autoresize />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.update.tel')"
              name="tel"
            >
              <UInput v-model="state.tel" />
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
              {{ i18n.t("components.user.update.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.user.update.update") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
