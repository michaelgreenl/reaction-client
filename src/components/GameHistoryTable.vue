<script setup>
import { computed } from 'vue';
import { formatDate, formatTime } from '@/util/time.js';
import Button from '@/components/Button.vue';
import Loader from '@/components/Loader.vue';

const props = defineProps({
    games: {
        type: Array,
        required: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    showSettings: {
        type: Boolean,
        default: false,
    },
    sorted: {
        type: Object,
        required: true,
    },
    page: {
        type: Number,
        default: 1,
    },
    disableNext: {
        type: Boolean,
        default: false,
    },
    disablePrev: {
        type: Boolean,
        default: true,
    },
});

defineEmits(['sort', 'next-page', 'prev-page']);

const getSortLabel = (field, label) => {
    if (props.sorted.by !== field) return label;
    return props.sorted.order === 'ASC' ? `▴ ${label}` : `▾ ${label}`;
};
</script>

<template>
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>
                        <Button
                            preset="primary-alt"
                            :text="getSortLabel('score', 'Score')"
                            :disabled="loading"
                            @click="$emit('sort', 'score')"
                        />
                    </th>
                    <th>
                        <Button
                            preset="primary-alt"
                            :text="getSortLabel('time', 'Time')"
                            :disabled="loading"
                            @click="$emit('sort', 'time')"
                        />
                    </th>
                    <th v-if="showSettings">
                        <Button text="Circle Size" class="setting" />
                    </th>
                    <th v-if="showSettings">
                        <Button text="Spawn Interval" class="setting" />
                    </th>
                    <th v-if="showSettings">
                        <Button text="Shrink Time" class="setting" />
                    </th>
                    <th>
                        <Button
                            preset="primary-alt"
                            :text="getSortLabel('createdAt', 'Date')"
                            :disabled="loading"
                            @click="$emit('sort', 'createdAt')"
                        />
                    </th>
                </tr>
            </thead>
            <div v-if="loading" class="loader">
                <Loader text="Loading" />
            </div>
            <div v-if="games.length === 0 && !loading" class="loader">
                <span>No Games Found.</span>
            </div>
            <tbody
                :style="{
                    // Hiding element so the height can still affect the table size (matches original logic)
                    visibility: `${loading ? 'hidden' : 'visible'}`,
                    height: `${games.length > 0 ? games.length * 26 : 260}px`,
                }"
            >
                <tr v-for="game in games" :key="game.createdAt">
                    <td :class="{ sorted: sorted.by === 'score' }">
                        {{ game.score }}
                    </td>
                    <td :class="{ sorted: sorted.by === 'time' }">
                        {{ formatTime(game.time) }}
                    </td>
                    <template v-if="showSettings">
                        <td>{{ game.settings.circleSize }}px</td>
                        <td>
                            {{
                                game.settings.spawnInterval.toString().length === 4
                                    ? game.settings.spawnInterval.toFixed(2)
                                    : game.settings.spawnInterval.toFixed(1)
                            }}
                        </td>
                        <td>
                            {{
                                game.settings.shrinkTime.toString().length === 4
                                    ? game.settings.shrinkTime.toFixed(2)
                                    : game.settings.shrinkTime.toFixed(1)
                            }}
                        </td>
                    </template>
                    <td class="date" :class="{ sorted: sorted.by === 'createdAt' }">
                        <span>{{ formatDate(game.createdAt) }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="table-nav">
            <Button preset="primary-alt" text="prev" :disabled="loading || disablePrev" @click="$emit('prev-page')" />
            <span>
                {{ page }}
            </span>
            <Button preset="primary-alt" text="next" :disabled="loading || disableNext" @click="$emit('next-page')" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
    position: relative;
    z-index: 2;
    padding: $size-1 $size-2;
    max-width: 17em;
    overflow-x: scroll;

    @include bp-custom-min(450) {
        max-width: 20em;
    }

    @include bp-sm-phone {
        overflow-x: hidden;
        max-width: 34em;
    }

    &::-webkit-scrollbar {
        width: 6px !important;
        height: 6px !important;
        background: $color-bg-secondary;
    }

    &::-webkit-scrollbar-thumb {
        background: $color-gray3;
        border-radius: 6px;

        &:hover {
            background: darken-color($color-gray3, 5%);
        }

        &:active {
            background: darken-color($color-gray3, 10%);
        }
    }

    &::-webkit-scrollbar:horizontal {
        height: 12px;
    }

    table {
        font-size: 0.9em;
        border-bottom: solid 1px $color-gray3;
        border-collapse: collapse;

        @include bp-custom-min(450) {
            font-size: 1em;
        }

        .loader {
            min-height: auto;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            color: $color-text-secondary-dark;
            margin: $size-4 auto 0;

            span {
                font-size: 0.9em;
                text-shadow: 1px 1px 2px #00000033;
            }
        }

        :deep(button) {
            font-size: 1.2em;

            &.setting {
                font-size: 0.8em;
                color: $color-text-secondary-dark;
                cursor: auto;

                span {
                    white-space: wrap;
                }

                &:hover {
                    transform: scale(1);
                }
            }
        }

        th,
        td {
            padding: $size-1;
            text-align: center;
        }

        td {
            font-size: 0.85em;
            color: $color-text-secondary-dark;
            font-weight: 500;
            border: solid 1px $color-gray3;

            &.date {
                font-family: $secondary-font-stack;
                font-size: 0.75em;
                font-weight: 400;
                color: $color-gray6;
                padding: 0 $size-2;

                span {
                    display: flex;
                    justify-content: center;
                    width: 8em;
                }
            }

            &.sorted {
                background: darken-color($color-gray1, 2%);
            }
        }
    }
}

.table-nav {
    position: relative;
    z-index: 2;
    @include flexCenterAll;
    padding-top: $size-1;

    :deep(button) {
        font-size: 1em;
    }

    span {
        color: $color-text-secondary-dark;
        border-bottom: solid 1px $color-gray3;
        width: 1ch;
        text-align: center;
    }
}
</style>
