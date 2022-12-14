/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import store from "../__mocks__/store.js";

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({pathname});
};

describe("Given I am connected as an employee", () => {

    describe("When i am in Loading page", () => {
        test("Then, Loading page should be rendered ", () => {
            // DOM construction
            document.body.innerHTML = BillsUI({ loading: true });
            // expected result
            expect(screen.getAllByText('Loading...')).toBeTruthy();
        })
    })

    describe('When a back-end send an error message', () => {
        test('Then, Error page should be rendered', () => {
            // DOM construction
            document.body.innerHTML = BillsUI({ error: 'some error message' });
            // expected result
            expect(screen.getAllByText('Erreur')).toBeTruthy();
        });
    });

    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            //to-do write expect expression
            expect(windowIcon.className).toEqual("active-icon");
        })

        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
    })

    describe("When I am on Bills Page and there are no bill", () => {
        test("Then bills should render an empty table", () => {
            // DOM construction
            document.body.innerHTML = BillsUI({data: []});
            const eyeIcon = screen.queryByTestId('icon-eye');
            // expected result
            expect(eyeIcon).toBeNull();
        })
    })

    describe("When i click on the new bill button 'Nouvelle note de frais'", () => {
        test('Then I should navigate to newBill page bill/new', () => {
            document.body.innerHTML = BillsUI({data: bills});
            // init bills display
            const billsContainer = new Bills({
                document, onNavigate, store: null, localStorage: window.localStorage,
            });

            // handle click event
            const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
            const newBillButton = screen.getByTestId('btn-new-bill');
            newBillButton.addEventListener('click', handleClickNewBill);
            userEvent.click(newBillButton);

            // expected results
            expect(handleClickNewBill).toHaveBeenCalled();
            expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
        })
    })

    describe("When i click on an icon eye", () => {
        test("Then a modal should open", () => {
            document.body.innerHTML = BillsUI({data: bills});
            // init bills display
            const billsContainer = new Bills({
                document, onNavigate, store: null, localStorage: window.localStorage,
            });
            // get DOM element
            const iconEye = screen.getAllByTestId('icon-eye')[0];
            // handle click event
            const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye(iconEye));
            iconEye.addEventListener('click', handleClickIconEye);
            userEvent.click(iconEye);
            // expected result
            expect(handleClickIconEye).toHaveBeenCalled();
        });

        test("Then the modal should display the attached image", () => {
            // DOM construction
            document.body.innerHTML = BillsUI({data: bills});
            // init bills display
            const billsContainer = new Bills({
                document, onNavigate, store: null, localStorage: window.localStorage,
            });
            // get DOM element
            const iconEye = screen.getAllByTestId('icon-eye')[0];
            // handle click event
            billsContainer.handleClickIconEye(iconEye);
            // expected results
            expect(document.querySelector('.modal')).toBeTruthy();
        })
    })
})

// INTEGRATION TESTS
describe("[INTEGRATION TEST] Given I am connected as an employee", () => {
    describe("When I navigate to BillsUI", () => {
        test("fetches bills from mock API GET", async () => {
            const billsSpy = jest.spyOn(store, 'bills');
            const bills = await store.bills().list();
            expect(billsSpy).toHaveBeenCalledTimes(1);
            expect(bills).toBeTruthy();
            expect(bills.length).toEqual(4);
        })
    });

    describe('When i update a bill', () => {
        test("then its ok", async () => {
            const billsSpy = jest.spyOn(store, 'bills');
            const updateBill = {
                "id": "AAAAAAAAAAAAAAAAA",
                "vat": "AAAAAAAAAAA",
                "amount": 100,
                "name": "AAAAA",
                "fileName": "AAAAAA.jpeg",
                "commentary": "AAAAAA",
                "pct": 20,
                "type": "AAAAAAA",
                "email": "a@a",
                "fileUrl": "AAAAAAAAAAAAAAAAAAAAAAA",
                "date": "AAAAAAAAAAAAAAA",
                "status": "AAAAAAA",
                "commentAdmin": "AAAAAAAAA"
            };
            const bills = await store.bills().update(updateBill);
            expect(billsSpy).toHaveBeenCalled();
            expect(bills).toBeTruthy();
            expect(bills.id).toEqual("47qAXb6fIm2zOKkLzMro");
        })
    });

    describe("When i fetch the API and get (404) NOT FOUND ERROR", () => {
        test("then should show 404", async () => {
            // when call bills get 404 error
            jest.spyOn(store, 'bills').mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')));
            // DOM
            document.body.innerHTML = BillsUI({ error: 'Erreur 404' });
            // await response
            const message = await screen.getByText('Erreur 404');
            // expected result
            expect(message).toBeTruthy();
        })
    });

    describe("When i fetch the API and get (500) INTERNAL SERVER ERROR", () => {
        test("then should show 500", async () => {
            // when call bills get 404 error
            jest.spyOn(store, 'bills').mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')));
            // DOM
            document.body.innerHTML = BillsUI({ error: 'Erreur 500' });
            // await response
            const message = await screen.getByText('Erreur 500');
            // expected result
            expect(message).toBeTruthy();
        })
    });
})
