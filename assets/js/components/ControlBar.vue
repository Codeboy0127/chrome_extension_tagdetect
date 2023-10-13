<template>
    <div class="control-bar">
          <img v-if="!isInspecting && controlBar.record" src="../../images/record.svg" @click="toggleInspection">
          <img v-if="isInspecting && controlBar.record" src="../../images/pause.svg" @click="toggleInspection">
          <img v-if="controlBar.clear" src="../../images/clear.svg" @click="resetData">
          <img v-if="controlBar.collapse" src="../../images/collapse.svg" @click="collapseAll">
          <img v-if="controlBar.expand" src="../../images/expand.svg" @click="expandAll">
          <img v-if="controlBar.save" src="../../images/import.svg" @click="exportData">
          <img v-if="controlBar.settings" src="../../images/settings.png" @click="toggleSettingsPanel">
    </div>
</template>

<script>
export default {
    props: {
        isInspecting:{
            type: Boolean
        },
        controlBar:{
            type: Object
        }
    },
    methods:{
        //TODO - It should only collapse the accordion of the current tab
        collapseAll(){
            this.$emit("collapseAll")
        },
        //TODO - It should only expand the accordion of the current tab
        expandAll(){
            
            this.$emit("expandAll")
        },
        toggleSettingsPanel(){
            
            this.$emit("toggleSettingsPanel")
        },
        exportData(){
            this.$emit("exportData")
        },
        importData(){
            this.$emit("importData")
        },
        toggleInspection(){
            this.$emit("toggleInspection")
        },
        resetData(){
            this.$emit("resetData")
        }
    },
}
</script>

<style lang="css">
.control-bar{
    margin-left: auto;
    display: flex;
    column-gap: 8px;
}
.control-bar img{
    height: 24px;
    cursor: pointer;
}
</style>