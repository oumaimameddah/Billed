import { ROUTES_PATH } from '../constants/routes.js';
import Logout from './Logout.js';

export default class {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.firestore = firestore;
    const buttonNewBill = document.querySelector(
        `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener('click', this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener('click', (e) => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = (e) => {
    this.onNavigate(ROUTES_PATH['NewBill']);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute('data-bill-url');
    // modified img width
    $('#modaleFile')
        .find('.modal-body')
        .html(
            `<div style='text-align: center;'><img width='auto' src=${billUrl} /></div>`
        );
    $('#modaleFile').modal('show');
  };

  // not need to cover this function by tests
  getBills = () => {
    const userEmail = localStorage.getItem("user") ?
        JSON.parse(localStorage.getItem("user")).email : ""
    if (this.firestore) {
      return this.firestore
          .bills()
          .get()
          .then((snapshot) => {
            const bills = snapshot.docs
                .map((doc) => ({
                  ...doc.data() }))
                .filter((bill) => bill.email === userEmail)
            console.log('length', bills.length)
            return bills
          })
          .catch(error => error)
    }
  }
}