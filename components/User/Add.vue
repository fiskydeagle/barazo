<script setup lang="ts">
import { type InferType, number, object, string } from "yup";
import { UserRole } from "~/types";
import type { FormSubmitEvent } from "#ui/types";

const i18n = useI18n();

type Props = {
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
  email: string().email("Invalid email").required("Required"),
  password: string()
    .min(8, "Must be at least 8 characters")
    .required("Required"),
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
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  role: undefined,
  shopId: undefined,
  password: undefined,
  city: "vu",
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
  () => state.role,
  (role) => {
    if (role === UserRole.SUPERADMIN) {
      state.shopId = undefined;
    }
  },
);

watch(
  () => isOpen.value,
  (isOpen) => {
    if (!isOpen) {
      Object.assign(state, {
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        role: undefined,
        shopId: undefined,
        password: undefined,
        city: "vu",
        address: undefined,
        tel: undefined,
      });
    } else getShops();
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
      class="space-y-4 max-w-3xl"
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
              {{ i18n.t("components.user.add.add-user") }}
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
              :label="i18n.t('components.user.add.role')"
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
                :placeholder="i18n.t('components.user.add.role')"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.first-name')"
              name="firstName"
            >
              <UInput v-model="state.firstName" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.last-name')"
              name="lastName"
            >
              <UInput v-model="state.lastName" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.email')"
              name="email"
            >
              <UInput v-model="state.email" />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.password')"
              name="password"
            >
              <UInput v-model="state.password" type="password" />
            </UFormGroup>
          </div>
          <div class="w-full flex flex-col gap-4">
            <UFormGroup
              v-if="
                state.role !== UserRole.SUPERADMIN &&
                user?.role === UserRole.SUPERADMIN
              "
              size="lg"
              :label="i18n.t('components.user.add.shop')"
              name="shopId"
            >
              <USelectMenu
                v-model="state.shopId"
                searchable
                :searchable-placeholder="
                  i18n.t('components.user.add.search-shop')
                "
                :placeholder="i18n.t('components.user.add.shop')"
                :options="shops"
                value-attribute="id"
                option-attribute="name"
                :search-attributes="['name']"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.city')"
              name="city"
            >
              <USelectMenu
                v-model="state.city"
                searchable
                :searchable-placeholder="
                  i18n.t('components.user.add.search-city')
                "
                :placeholder="i18n.t('components.user.add.city')"
                :options="kosovoCities"
                value-attribute="code"
                option-attribute="name"
                :search-attributes="['name']"
              />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.address')"
              name="address"
            >
              <UTextarea v-model="state.address" autoresize />
            </UFormGroup>

            <UFormGroup
              size="lg"
              :label="i18n.t('components.user.add.tel')"
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
              {{ i18n.t("components.user.add.cancel") }}
            </UButton>

            <UButton
              class="justify-center"
              size="lg"
              type="submit"
              :loading="loading"
            >
              {{ i18n.t("components.user.add.add") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>
  </UModal>
</template>
