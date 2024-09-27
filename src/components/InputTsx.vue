<script lang="tsx">
import { defineComponent } from 'vue';
import { Input } from 'ant-design-vue';
export default defineComponent({
  name: 'ButtonTsx',
  setup(_, { attrs }) {
    return () => <Input {...attrs} />;
  }
});
</script>
