<template>
  <span :id="id" class="show-more">
    {{ displayedText }}
    <a href="#" @click.prevent="toggleText" v-show="text.length > 45">{{ buttonText }}</a>
  </span>
</template>

<script>
export default {
  data() {
    return {
      isFullTextVisible: false,
    };
  },
  props: {
    text: {
      type: String,
      required: true
    },
    id: {
      type: String
    }
  },
  computed: {
    displayedText() {
      return (this.isFullTextVisible || this.text.length < 45) ? this.text : this.text.substring(0, 45) + '...';
    },
    buttonText() {
      return this.isFullTextVisible ? 'Show less' : 'Show more';
    }
  },
  methods: {
    toggleText() {
      this.isFullTextVisible = !this.isFullTextVisible;
    }
  }
};
</script>

<style scoped>
.show-more {
  /* display: flex;
  justify-content: space-between; */
  background-color: #fafafa;
}

.show-more a {
  float: right;
}
</style>