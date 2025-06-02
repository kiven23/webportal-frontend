<template>
  <v-container>
    <v-form ref="form">
      <v-card class="pa-4 mb-6">
        <v-card-title>Applicant Information</v-card-title>
        <v-text-field v-model="form.fullName" label="Full Name" required />
        <v-text-field v-model="form.dob" label="Date of Birth (YYYY-MM-DD)" type="date" required />
        <v-select v-model="form.civilStatus" :items="['Single', 'Married', 'Widowed', 'Separated']" label="Civil Status" required />
        <v-text-field v-model="form.address" label="Address" required />
        <v-text-field v-model="form.contactNumber" label="Contact Number" required />
        <v-text-field v-model="form.email" label="Email Address" type="email" required />
      </v-card>

      <v-card class="pa-4 mb-6">
        <v-card-title>Employment and Income</v-card-title>
        <v-text-field v-model="form.employer" label="Employer Name" required />
        <v-text-field v-model="form.jobTitle" label="Position / Job Title" required />
        <v-text-field v-model="form.monthlyIncome" label="Monthly Income" type="number" required />
      </v-card>

      <v-card class="pa-4 mb-6">
        <v-card-title>Purchase Details</v-card-title>
        <v-text-field v-model="form.item" label="Item to Purchase" required />
        <v-text-field v-model="form.brandModel" label="Brand / Model (optional)" />
        <v-text-field v-model="form.price" label="Item Price" type="number" required />
        <v-text-field v-model="form.downPayment" label="Down Payment Amount" type="number" />
        <v-text-field v-model="form.loanAmount" label="Loan Amount Requested" type="number" required />
        <v-text-field v-model="form.loanTerm" label="Loan Term (in months)" type="number" required />
        <v-text-field v-model="form.monthlyInstallment" label="Monthly Installment Amount" type="number" required />
        <v-text-field v-model="form.purchasePurpose" label="Purpose of Purchase (optional)" />
      </v-card>

      <v-card class="pa-4 mb-6">
        <v-card-title>Identification Numbers</v-card-title>
        <v-text-field v-model="form.tin" label="TIN / Tax Identification Number" />
        <v-text-field v-model="form.sss" label="SSS / GSIS Number" />
      </v-card>

      <v-card class="pa-4 mb-6">
        <v-card-title>Supporting Documents to Upload</v-card-title>
        <v-file-input v-model="form.validId" label="Valid Government ID" accept="image/*,.pdf" />
        <v-file-input v-model="form.proofOfBilling" label="Proof of Billing / Residence" accept="image/*,.pdf" />
        <v-file-input v-model="form.employmentProof" label="Employment Certificate or Company ID" accept="image/*,.pdf" />
      </v-card>

      <v-btn color="primary" @click="submitForm">Submit Application</v-btn>
    </v-form>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      form: {
        fullName: '',
        dob: '',
        civilStatus: '',
        address: '',
        contactNumber: '',
        email: '',
        employer: '',
        jobTitle: '',
        monthlyIncome: null,
        item: '',
        brandModel: '',
        price: null,
        downPayment: null,
        loanAmount: null,
        loanTerm: null,
        monthlyInstallment: null,
        purchasePurpose: '',
        tin: '',
        sss: '',
        validId: null,
        proofOfBilling: null,
        employmentProof: null
      }
    }
  },
  methods: {
    submitForm() {
      if (this.$refs.form.validate()) {
        console.log("Form Submitted", this.form);
        alert("Application submitted successfully!");
      }
    }
  }
}
</script>

<style scoped>
.v-card-title {
  font-weight: bold;
  font-size: 18px;
}
</style>
