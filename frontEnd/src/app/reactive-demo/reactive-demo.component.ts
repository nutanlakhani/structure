import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'app-reactive-demo',
  templateUrl: './reactive-demo.component.html',
  styleUrls: ['./reactive-demo.component.scss']
})
export class ReactiveDemoComponent implements OnInit {

  simpleForm: FormGroup;

  constructor(private fb: FormBuilder) {     
  }

  ngOnInit() {
    this.simpleForm = this.fb.group({
      firstName : new FormControl('', Validators.required),
      hobiees: new FormArray([])
    });
  }
  get hobiees() {
    return (<FormArray>this.simpleForm.controls['hobiees']);
  }
  // get hobiees() {
  //   return this.simpleForm.get("hobiees") as FormArray;
  // }

  addHobiie(){
    this.hobiees.push(new FormControl(''))
    // this.simpleForm.controls.hobiees.push(new FormControl(''));
  }
  removeHobiie(index){
    this.hobiees.removeAt(index)
    // this.simpleForm.controls.hobiees.removeAt(index);
  }
 

  submitForm(){
    console.log("submit form call", this.simpleForm);
  }

}
