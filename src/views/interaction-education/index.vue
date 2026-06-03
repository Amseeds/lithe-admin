<script setup lang="ts">
import { ref } from 'vue'
import { ScrollContainer } from '@/components'
import { useInjection } from '@/composables'
import { NCard, NTabs, NTabPane } from 'naive-ui'
import { mediaQueryInjectionKey } from '@/injection'
import DrugInteractionRecognition from './components/DrugInteractionRecognition.vue'
import PatientMedicationEducation from './components/PatientMedicationEducation.vue'

defineOptions({ name: 'InteractionEducation' })

const { isMaxMd, isMaxLg } = useInjection(mediaQueryInjectionKey)
const activeTab = ref('drug-interaction')
</script>

<template>
  <ScrollContainer
    wrapper-class="flex flex-col gap-y-4 interaction-education-page"
    :scrollable="isMaxLg"
  >
    <NCard
      class="main-card flex-1"
      :size="isMaxMd ? 'small' : undefined"
      content-class="flex flex-col min-h-0"
    >
      <NTabs
        v-model:value="activeTab"
        type="line"
        animated
      >
        <NTabPane
          name="drug-interaction"
          tab="药品相互作用识别"
        />
        <NTabPane
          name="patient-education"
          tab="患者用药教育"
        />
      </NTabs>

      <DrugInteractionRecognition v-if="activeTab === 'drug-interaction'" />
      <PatientMedicationEducation v-else />
    </NCard>
  </ScrollContainer>
</template>

<style lang="scss" scoped>
.interaction-education-page {
  padding: 20px 24px;
  background: linear-gradient(160deg, #f0f4f8 0%, #f5f7fa 100%);

  @media (max-width: 768px) {
    padding: 12px 8px;
  }
}

.main-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #ffffff;
  border-radius: 14px;
  overflow: visible;
  box-shadow:
    0 2px 12px rgba(64, 158, 255, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(64, 158, 255, 0.06);

  :deep(.n-card__content) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}
</style>
