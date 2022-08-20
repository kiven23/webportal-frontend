import Home from "../views/Home";
import Users from "../views/users/Users";
import Employments from "../views/users/employments/Employments";
import Branches from "../views/branches/Branches";
import Bscheds from "../views/branches/schedules/Schedules";
import Regions from "../views/regions/Regions";
import Divisions from "../views/divisions/Divisions";
import Departments from "../views/departments/Departments";
import Positions from "../views/positions/Positions";
import Roles from "../views/roles/Roles";
import Permissions from "../views/permissions/Permissions";

// Products
import ProductItems from "../views/products/items/Items";
import ProductBrands from "../views/products/brands/Brands";
import ProductCategories from "../views/products/categories/Categories";

// Serives
import ServiceTypes from "../views/services/types/Types";
import ServiceCategories from "../views/services/categories/Categories";
import ServiceProviders from "../views/services/providers/Providers";

// Tickets
import ComputerwareTickets from "../views/tickets/computerwares/Computerwares";
import ConnectivityTickets from "../views/tickets/connectivities/Connectivities";

// Power Interruptions
import PowerInterruptions from "../views/power_interruptions/PowerInterruptions";

// Pending Transactions
import PendingTrans from "../views/pending_trans/PendingTrans";

// Archived For Land
import archived from "../views/government_compliance/archived_for_land/archived.vue"
// Agencies
import agencies from "../views/government_compliance/agencies/agencies.vue"
//Creding And Collection
import credit_standing from "../views/credit_collection/credit_portal/credit_portal.vue"
import black_listed from "../views/credit_collection/black_listed/blacklisted.vue"
import customer_digitized from "../views/credit_collection/customer_digitized/digitized.vue"
import installment_due from "../views/credit_collection/installment_due_of_customer/installment.vue" 
import aging_reconciliation from "../views/credit_collection/aging_reconciliation/reconciliation.vue" 
import dunning_letters from "../views/credit_collection/dunning_letters/dunning.vue";
//Raffle Draw
import raffle from "../components/standalone/raffle.vue";
//SmS Gift Code
import giftcode from "../views/sms_system/automated_giftcode/giftcode.vue";


const viewRoutes = [
  {
    path: "/",
    component: Home,
    name: "home",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/users",
    component: Users,
    name: "users",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/branches",
    component: Branches,
    name: "branches",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/regions",
    component: Regions,
    name: "regions",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/divisions",
    component: Divisions,
    name: "divisions",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/departments",
    component: Departments,
    name: "departments",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/branch-schedules",
    component: Bscheds,
    name: "branch-schedules",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/positions",
    component: Positions,
    name: "positions",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/permissions",
    component: Permissions,
    name: "permissions",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/roles",
    component: Roles,
    name: "roles",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/user-employments",
    component: Employments,
    name: "user-employments",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/product-items",
    component: ProductItems,
    name: "product-items",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/product-brands",
    component: ProductBrands,
    name: "product-brands",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/product-categories",
    component: ProductCategories,
    name: "product-categories",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/service-types",
    component: ServiceTypes,
    name: "service-types",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/service-categories",
    component: ServiceCategories,
    name: "service-categories",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/service-providers",
    component: ServiceProviders,
    name: "service-providers",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/computerware-tickets",
    component: ComputerwareTickets,
    name: "computerware-tickets",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/connectivity-tickets",
    component: ConnectivityTickets,
    name: "connectivity-tickets",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/power-interruptions",
    component: PowerInterruptions,
    name: "power-interruptions",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/pending-transactions",
    component: PendingTrans,
    name: "pending-transactions",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/archived",
    component: archived,
    name: "archived-for-land",
    meta: {
      requiresAuth: true
    }
  },
  
  {
    path: "/agencies",
    component: agencies,
    name: "agencies",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/ccs/creditstanding/dashboard",
    component: credit_standing,
    name: "credit_standing",
    meta: {
      requiresAuth: true
    }
  },

  {
    path: "/ccs/blacklisted/dashboard",
    component: black_listed,
    name: "black_listed",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/ccs/customerdigitized/dashboard",
    component: customer_digitized,
    name: "customer_digitized_req",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/ccs/installment/dashboard",
    component: installment_due,
    name: "installment",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/ccs/reconciliation/dashboard",
    component: aging_reconciliation,
    name: "reconciliation",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/ccs/dunning-letters",
    component: dunning_letters,
    name: "dunning",
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/raffle",
    component: raffle,
    name: "raffle",
    meta: {
      requiresAuth: false
    }
  },

  {
    path: "/giftcodes/index",
    component: giftcode,
    name: "giftcode",
    meta: {
      requiresAuth: true
    }
  },
 
];
export default viewRoutes;
