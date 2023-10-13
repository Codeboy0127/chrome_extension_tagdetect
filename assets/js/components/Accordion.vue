<template>
    <div  :class='styling + " accordion"'>
        <h3 :id="id" @click="toggleAccordion($event)" :class="!isOpen ? '' : 'selected'">
          <slot name="icon">
              
          </slot>
          <span class="title">
            {{title}}
            <span @click.stop>
              <slot name="editTitle" >
                
              </slot>
            </span>
          </span>
          <div class="accordion-buttons" @click.stop>
            <slot name="buttons">
              
            </slot>
            <slot name="extra">
              
            </slot>
          </div>
        </h3>
        <div class='content custom-scrollbar square' :style="!isOpen ? 'display: none;' : ''">
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
        default: false
      }
    },
    methods:{
        toggleAccordion(event){
            $(event.currentTarget).next('.content').slideToggle(500);
            $(event.currentTarget).toggleClass('selected');
        }
    },
}
</script>


<style type="text/css">

.accordion {
  margin-top: 0.5em;
  cursor: pointer;
}
.accordion h3 {
  padding: 0 0.5em;
}
.accordion-buttons{
  margin-left: auto;
}
.accordion .content {
  line-height: 1.5;
  padding: 0.5em;
}

.accordion h3:before {
  content: "+";
  padding-right: 0.25em;
  color: #becbd2;
  font-size: 1.5em;
  font-weight: 500;
  position: relative;
  right: 0;
}
.accordion.green-header > h3{
  background: #12B922;
}
.accordion.gray-header > h3{
  background: rgba(0, 0, 0, 0.39);
}
.accordion h3 {
  color: #fff;
  padding: 8px;
  border-radius: 10px 10px 10px 10px;
  display: flex;
  align-items: center;
  padding: 8px 14px;
}
.accordion h3.selected:before {
  content: "-";
}
.accordion .content {
  color: #414141;
  border: 0.063em solid #12B922;
  border-top: none;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}
.rounded.accordion .selected {
    color: white;
    /* padding: 8px; */
    border-radius: 10px 10px 0px 0px;
}
.flat.accordion .selected {
    background: #ffffff;
    color: #414141;
    padding: 8px 0px;
    border-radius: 10px 10px 0px 0px;
}
.flat.accordion {
    background: #ffffff;
    color: #414141;
    padding: 8px 0px;
    border-radius: 0px;
}
.flat.accordion h3{
    background: #ffffff;
    color: #414141;
    padding: 8px;
    border-radius: 0px;
}
.flat.accordion .content {
  border: none;
  border-top: none;
  background-color: #F5F5F5;
}
.content span{
  /*word-break: break-all;
  white-space: break-spaces;*/
  
  word-wrap: break-word;
  word-break: break-all;
}

.content .title{
  white-space: normal;
}

</style>