<template>
  <div class="v-datepicker-wrapper" ref="datePickerRef">
    <div class="v-datepicker-input-wrapper">
      <input
        type="text"
        :value="formattedDate"
        :placeholder="placeholder"
        :disabled="disabled"
        class="v-datepicker-input"
        @click="toggleCalendar"
        @keydown.escape="closeCalendar"
        readonly
      />
      <svg class="v-datepicker-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
      </svg>
    </div>
    
    <transition name="calendar">
      <div v-if="isOpen" class="v-datepicker-calendar">
        <div class="v-datepicker-header">
          <button type="button" class="v-datepicker-nav" @click="previousMonth" aria-label="Previous month">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <span class="v-datepicker-title">{{ currentMonthYear }}</span>
          <button type="button" class="v-datepicker-nav" @click="nextMonth" aria-label="Next month">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="v-datepicker-weekdays">
          <div v-for="day in weekdays" :key="day" class="v-datepicker-weekday">{{ day }}</div>
        </div>
        
        <div class="v-datepicker-days">
          <button
            v-for="day in calendarDays"
            :key="`${day.year}-${day.month}-${day.date}`"
            type="button"
            :class="getDayClasses(day)"
            @click="selectDate(day)"
            :disabled="isDayDisabled(day)"
          >
            {{ day.date }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue';

export interface VDatePickerProps {
  modelValue: Date | null;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const props = withDefaults(defineProps<VDatePickerProps>(), {
  placeholder: 'Select date',
  disabled: false,
  format: 'MM/DD/YYYY',
});

const emit = defineEmits<{
  'update:modelValue': [value: Date | null];
}>();

const isOpen = ref(false);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const datePickerRef = ref<HTMLElement | null>(null);

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const currentMonthYear = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

const formattedDate = computed(() => {
  if (!props.modelValue) return '';
  const date = props.modelValue;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
});

const calendarDays = computed((): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);
  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Previous month days
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = prevLastDay.getDate() - i;
    days.push({
      date,
      month: currentMonth.value - 1,
      year: currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    });
  }
  
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayDate = new Date(currentYear.value, currentMonth.value, i);
    dayDate.setHours(0, 0, 0, 0);
    
    days.push({
      date: i,
      month: currentMonth.value,
      year: currentYear.value,
      isCurrentMonth: true,
      isToday: dayDate.getTime() === today.getTime(),
      isSelected: props.modelValue ? dayDate.getTime() === new Date(props.modelValue).setHours(0, 0, 0, 0) : false,
    });
  }
  
  // Next month days
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: i,
      month: currentMonth.value + 1,
      year: currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    });
  }
  
  return days;
});

function toggleCalendar() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.modelValue) {
    currentMonth.value = props.modelValue.getMonth();
    currentYear.value = props.modelValue.getFullYear();
  }
}

function closeCalendar() {
  isOpen.value = false;
}

function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function selectDate(day: CalendarDay) {
  if (isDayDisabled(day)) return;
  const date = new Date(day.year, day.month, day.date);
  emit('update:modelValue', date);
  closeCalendar();
}

function isDayDisabled(day: CalendarDay): boolean {
  const date = new Date(day.year, day.month, day.date);
  if (props.minDate && date < props.minDate) return true;
  if (props.maxDate && date > props.maxDate) return true;
  return false;
}

function getDayClasses(day: CalendarDay) {
  return [
    'v-datepicker-day',
    {
      'v-datepicker-day--other-month': !day.isCurrentMonth,
      'v-datepicker-day--today': day.isToday,
      'v-datepicker-day--selected': day.isSelected,
      'v-datepicker-day--disabled': isDayDisabled(day),
    },
  ];
}

function handleClickOutside(event: MouseEvent) {
  if (datePickerRef.value && !datePickerRef.value.contains(event.target as Node)) {
    closeCalendar();
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for open state to add/remove click listener
if (isOpen.value) {
  document.addEventListener('click', handleClickOutside);
} else {
  document.removeEventListener('click', handleClickOutside);
}
</script>

<style scoped>
.v-datepicker-wrapper {
  position: relative;
  width: 100%;
}

.v-datepicker-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.v-datepicker-input {
  flex: 1;
  font-family: var(--font-family-base);
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-card-white);
  border: 1px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  padding: var(--spacing-3) var(--spacing-4);
  cursor: pointer;
  transition: border-color var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.v-datepicker-input:hover:not(:disabled) {
  border-color: var(--color-text-secondary);
}

.v-datepicker-input:focus {
  outline: none;
  border-color: var(--color-venmo-blue);
  box-shadow: var(--shadow-focus);
}

.v-datepicker-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-background);
}

.v-datepicker-icon {
  position: absolute;
  right: var(--spacing-4);
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.v-datepicker-calendar {
  position: absolute;
  top: calc(100% + var(--spacing-2));
  left: 0;
  background-color: var(--color-card-white);
  border: 1px solid var(--color-border-gray);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-4);
  z-index: var(--z-index-popover);
  min-width: 280px;
}

.v-datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.v-datepicker-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.v-datepicker-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--duration-base) var(--ease-out);
}

.v-datepicker-nav:hover {
  background-color: var(--color-venmo-blue-50);
}

.v-datepicker-nav svg {
  width: var(--icon-md);
  height: var(--icon-md);
  color: var(--color-text-secondary);
}

.v-datepicker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-2);
}

.v-datepicker-weekday {
  text-align: center;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
}

.v-datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-1);
}

.v-datepicker-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-body-sm);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  min-height: 36px;
}

.v-datepicker-day:hover:not(.v-datepicker-day--disabled) {
  background-color: var(--color-venmo-blue-50);
}

.v-datepicker-day--other-month {
  color: var(--color-text-tertiary);
}

.v-datepicker-day--today {
  font-weight: var(--font-weight-bold);
  background-color: var(--color-venmo-blue-50);
}

.v-datepicker-day--selected {
  background: var(--gradient-primary);
  color: var(--color-card-white);
  font-weight: var(--font-weight-semibold);
}

.v-datepicker-day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

/* Calendar transition */
.calendar-enter-active,
.calendar-leave-active {
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}

.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

