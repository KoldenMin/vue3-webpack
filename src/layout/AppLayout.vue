<template>
  <div class="app-layout">
    <Navbar/>
    <div class="main-content">
      <router-view/>
    </div>
  </div>
</template>

<script>
import NavbarBak from '@/components/Navbar.vue';

export default {
  name: 'AppLayout',
  components: {
    Navbar: NavbarBak
  }
};
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}
</style>