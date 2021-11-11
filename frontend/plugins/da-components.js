import Vue from 'vue'
import Nav from '~/components/UI/UiNav'
import NavItem from '~/components/UI/UiNavItem'

const components = {
  Nav,
  NavItem
}

Object.entries(components).forEach(([name, component]) => {
  Vue.component(name, component)
})
