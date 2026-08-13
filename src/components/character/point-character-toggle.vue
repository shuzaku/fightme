<!-- @format -->
<template>
    <div class="pct-row">
        <button
            type="button"
            class="pct"
            :class="{ 'pct--on': value }"
            role="switch"
            :aria-checked="value ? 'true' : 'false'"
            @click="$emit('input', !value)"
        >
            <span class="pct-inner">
                <span class="pct-track"><span class="pct-thumb"></span></span>
                <span class="pct-label">Point only</span>
            </span>
        </button>
        <span class="pct-hint">
            Show only matches where this character was played on point (listed first).
        </span>
    </div>
</template>

<script>
export default {
    name: 'PointCharacterToggle',

    props: {
        value: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style>
.pct-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.pct {
    padding: 8px 18px;
    background: #1c1f2b;
    border: 1px solid #ffffff26;
    border-radius: 0;
    cursor: pointer;
    transform: skewX(-8deg);
    transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.pct:hover {
    border-color: #3eb48980;
    background: #22392f;
}

.pct--on {
    background: #3eb4891f;
    border-color: #3eb489;
    box-shadow: 0 4px 14px rgba(62, 180, 137, 0.25);
}

.pct-inner {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transform: skewX(8deg);
}

.pct-track {
    position: relative;
    width: 34px;
    height: 16px;
    flex-shrink: 0;
    background: #ffffff1f;
    border: 1px solid #ffffff26;
    transition: background 0.15s ease, border-color 0.15s ease;
}

.pct--on .pct-track {
    background: #3eb489;
    border-color: #5ae1ae;
}

.pct-thumb {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 12px;
    height: 12px;
    background: #ffffffb3;
    transition: transform 0.18s ease, background 0.15s ease;
}

.pct--on .pct-thumb {
    background: #06231a;
    transform: translateX(18px);
}

.pct-label {
    font-family: 'Saira Condensed', 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffffffcc;
    white-space: nowrap;
}

.pct--on .pct-label {
    color: #5ae1ae;
}

.pct-hint {
    font-size: 12.5px;
    line-height: 1.5;
    color: #ffffff66;
}

.mobile .pct-hint {
    flex-basis: 100%;
}
</style>
