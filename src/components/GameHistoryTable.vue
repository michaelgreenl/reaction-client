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

function getSortLabel(field, label) {
    if (props.sorted.by !== field) return label;
    return props.sorted.order === 'ASC' ? `▴ ${label}` : `▾ ${label}`;
}
</script>

<template>
    <div class="table-wrapper">
        <div v-if="games.length === 0 && !loading" class="loader">
            <span>No Games Found.</span>
        </div>
        <div v-else class="table">
            <div class="column">
                <div class="column-header">
                    <Button
                        preset="primary-alt"
                        :text="getSortLabel('score', 'Score')"
                        :disabled="loading"
                        @click="$emit('sort', 'score')"
                    />
                </div>
                <div
                    v-for="game in games"
                    :key="game.createdAt"
                    class="column-cell"
                    :class="{ sorted: sorted.by === 'score' }"
                >
                    <span>
                        {{ game.score }}
                    </span>
                </div>
            </div>
            <div class="column">
                <div class="column-header">
                    <Button
                        preset="primary-alt"
                        :text="getSortLabel('time', 'Time')"
                        :disabled="loading"
                        @click="$emit('sort', 'time')"
                    />
                </div>
                <div
                    v-for="game in games"
                    :key="game.createdAt"
                    class="column-cell"
                    :class="{ sorted: sorted.by === 'time' }"
                >
                    <span>
                        {{ formatTime(game.time) }}
                    </span>
                </div>
            </div>
            <div v-if="showSettings" class="column column-setting">
                <div class="column-header column-header-setting">
                    <Button text="Circle Size" class="setting" />
                </div>
                <div v-for="game in games" :key="game.createdAt" class="column-cell setting-cell">
                    <span> {{ game.settings.circleSize }}px </span>
                </div>
            </div>
            <div v-if="showSettings" class="column column-setting">
                <div class="column-header column-header-setting">
                    <Button text="Spawn Interval" class="setting" />
                </div>
                <div v-for="game in games" :key="game.createdAt" class="column-cell setting-cell">
                    <span>
                        {{
                            game.settings.spawnInterval.toString().length === 4
                                ? game.settings.spawnInterval.toFixed(2)
                                : game.settings.spawnInterval.toFixed(1)
                        }}
                    </span>
                </div>
            </div>
            <div v-if="showSettings" class="column column-setting">
                <div class="column-header column-header-setting">
                    <Button text="Shrink Time" class="setting" />
                </div>
                <div v-for="game in games" :key="game.createdAt" class="column-cell setting-cell">
                    <span>
                        {{
                            game.settings.shrinkTime.toString().length === 4
                                ? game.settings.shrinkTime.toFixed(2)
                                : game.settings.shrinkTime.toFixed(1)
                        }}
                    </span>
                </div>
            </div>
            <div class="column">
                <div class="column-header">
                    <Button
                        preset="primary-alt"
                        :text="getSortLabel('createdAt', 'Date')"
                        :disabled="loading"
                        @click="$emit('sort', 'createdAt')"
                    />
                </div>
                <div
                    v-for="game in games"
                    :key="game.createdAt"
                    class="column-cell"
                    :class="{ sorted: sorted.by === 'createdAt' }"
                >
                    <span>
                        {{ formatDate(game.createdAt) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
    <div class="table-nav">
        <Button preset="primary-alt" text="prev" :disabled="loading || disablePrev" @click="$emit('prev-page')" />
        <span>
            {{ page }}
        </span>
        <Button preset="primary-alt" text="next" :disabled="loading || disableNext" @click="$emit('next-page')" />
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
}

.loader {
    height: 17.5em;
    color: $color-text-secondary-dark;
    margin: $size-4 auto 0;

    span {
        font-size: 0.9em;
        text-shadow: 1px 1px 2px #00000033;
    }
}

.table {
    font-size: 0.9em;
    display: flex;
    height: 100%;

    @include bp-custom-min(450) {
        font-size: 1em;
    }
}

.column {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    height: 100%;

    &:last-child {
        .column-header,
        .column-cell {
            max-width: 9.5em !important;
        }

        .column-cell {
            border-right: solid 1px $color-gray3;
            font-size: 0.5em;
            font-family: $secondary-font-stack;
            font-size: 0.75em;
            font-weight: 400;
            color: $color-gray6;

            span {
                display: flex;
                justify-content: center;
                width: 8em;
            }
        }
    }

    &-header,
    &-cell {
        @include flexCenterAll;
        flex: 1;
        white-space: nowrap;
        max-width: 78px !important;
    }

    &-header {
        font-size: 0.9em;
        height: 2.8em;
        padding: $size-2 0 $size-3;
        border-bottom: solid 1px $color-gray3;

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
    }

    &-cell {
        font-size: 0.85em;
        border-bottom: solid 1px $color-gray3;
        border-left: solid 1px $color-gray3;
        padding: 3px $size-4;
        color: $color-text-secondary-dark;

        &.sorted {
            background: darken-color($color-gray1, 2%);
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
        text-align: center;
        margin: 0 $size-1;
    }
}
</style>
