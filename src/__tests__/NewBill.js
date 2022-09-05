/**
 * @jest-environment jsdom
 */

import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import {ROUTES} from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js";

const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({pathname});
};

describe("Given I am connected as an employee", () => {

    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
    });

    window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
    }));

    describe("When I am on NewBill Page", () => {
        test("Then the newBill page should be rendered", () => {
            // DOM construction
            document.body.innerHTML = NewBillUI();
            // expected result
            expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
        })

        test("The the form 'Envoyer une note de frais' should be rendered", () => {
            // DOM construction
            document.body.innerHTML = NewBillUI();
            // get DOM element
            const form = document.querySelector('form');
            // expected result
            expect(form.length).toEqual(9);
        });

        describe('When I add an attached file', () => {
            // TEST : handle attached file format
            test('Then the file handler should be run', () => {
                // DOM construction
                document.body.innerHTML = NewBillUI();
                // get DOM element
                const newBill = new NewBill({
                    document, onNavigate, store: store, localStorage: window.localStorage,
                });
                // handle event
                const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
                const attachedFile = screen.getByTestId('file');
                attachedFile.addEventListener('change', handleChangeFile);
                fireEvent.change(attachedFile, {
                    target: {
                        files: [new File(['file.txt'], 'file.txt', {type: 'text/txt'})],
                    },
                });
                // expected result
                const numberOfFile = screen.getByTestId('file').files.length;
                expect(numberOfFile).toEqual(1);
            });
        });

        describe('when I submit a correct form', () => {
            // TEST : submit correct form and attached file
            test('then I should be redirected to Bills page', () => {
                // DOM construction
                document.body.innerHTML = NewBillUI();

                // get DOM element
                const newBillContainer = new NewBill({
                    document, onNavigate, store: null, localStorage: window.localStorage,
                });

                // handle event submit attached file
                const handleSubmit = jest.fn(newBillContainer.handleSubmit);
                newBillContainer.fileName = 'image.jpg';

                // handle event submit form
                const newBillForm = screen.getByTestId('form-new-bill');
                newBillForm.addEventListener('submit', handleSubmit);
                fireEvent.submit(newBillForm);

                // expected results
                expect(handleSubmit).toHaveBeenCalled();
                expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
            });
        });

        describe('When I submit a wrong attached file format', () => {
            test('Then the error message should be displayed', () => {
                // DOM construction
                document.body.innerHTML = NewBillUI();
                // get DOM element
                const newBill = new NewBill({
                    document, onNavigate, store: store, localStorage: window.localStorage,
                });
                // handle event
                const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
                const attachedFile = screen.getByTestId('file');
                attachedFile.addEventListener('change', handleChangeFile);
                fireEvent.change(attachedFile, {
                    target: {
                        files: [new File(['doc.pdf'], 'doc.pdf', {type: 'application/pdf'})],
                    },
                });
                // expected results
                expect(handleChangeFile).toHaveBeenCalled();
                expect(attachedFile.files[0].name).toBe('doc.pdf');
                expect(screen.getAllByText('Votre justificatif doit être une image de format (.jpg) ou (.jpeg) ou (.png)')).toBeTruthy();
            });
        });
    });
});

// POST
describe('[POST TESTS] Given I am connected as an employee', () => {
    describe("When I am on NewBill Page", () => {
        describe('When i submit the form', () => {
            test('Then it should generate a new bill', async () => {
                // Spy
                const postSpy = jest.spyOn(store, 'bills');

                // new Bill
                const newBill = {
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

                // create bill
                const bills = await store.bills().create(newBill);

                // expected results
                expect(postSpy).toHaveBeenCalledTimes(1);
                expect(bills).toBeTruthy();
                expect(bills.key).toEqual('1234');
            });
        })

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
    });
});
