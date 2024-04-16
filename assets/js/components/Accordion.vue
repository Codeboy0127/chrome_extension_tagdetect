<template>
  <div :class="styling + ' accordion'">
    <h3
      :id="id"
      @click="toggleAccordion($event)"
      :class="!isOpen ? '' : 'selected'"
    >
      <slot name="icon"></slot>
      <span class="title">
        {{ title }}
        <span @click.stop>
          <slot name="editTitle"> </slot>
        </span>
      </span>
      <div class="accordion-buttons" @click.stop>
        <slot name="buttons"> </slot>
        <slot name="extra"> </slot>
      </div>
    </h3>
    <div
      class="content custom-scrollbar square"
      :style="!isOpen ? 'display: none;' : ''"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  //TODO - Enforce propos details consistancy across all components
  props: {
    id: String,
    title: String,
    styling: String,
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    toggleAccordion(event) {
      $(event.currentTarget)
        .next(".content")
        .slideToggle(500);
      $(event.currentTarget).toggleClass("selected");
    },
  },
};
</script>

<style type="text/css">
.accordion {
  margin-top: 0.5em;
  cursor: pointer;
  border-radius: 10px;
}

.accordion-shadow {
  background-color: #ffffff;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}

.accordion-border {
  border: 1px solid #b2b2b2;
}

.accordion-buttons {
  margin-left: auto;
  display: flex;
  gap: 5px;
  padding-right: 10px;
}

.accordion .content {
  color: #414141;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  line-height: 1.5;
  padding: 1em 1.5em;
  gap: 0.5rem;
}
.accordion .rounded {
  border-radius: 10px;
}

.accordion h3 {
  color: #000;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 14px;
  font-weight: 300;
}

.accordion h3:after {
  content: "+";
  padding-right: 0.25em;
  font-size: 1.5em;
  font-weight: 500;
  position: relative;
  right: 0;
}
.accordion h3.selected:after {
  content: "-";
}
.accordion.green-header > h3 {
  background: #e6e9e6;
}
.accordion.gray-header > h3 {
  background: #d4d4d4;
}

.flat.accordion .selected {
  background: #ffffff;
  color: #414141;
  padding: 8px 0px;
}
.flat.accordion {
  background: #ffffff;
  color: #414141;
  padding: 8px 12px;
  border-radius: 10px;
}
.flat.accordion h3 {
  background: #ffffff;
  color: #414141;
  padding: 8px;
  display: flex;
}
.flat.accordion.content {
  border: none;
  border-top: none;
}
.content span {
  /*word-break: break-all;
  white-space: break-spaces;*/

  word-wrap: break-word;
  word-break: break-all;
}

.content .title {
  white-space: normal;
  /* font-weight: 500; */
  font-size: small;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.content .title svg {
  color: #414141;
}
</style>
