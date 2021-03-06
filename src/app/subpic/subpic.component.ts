import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, NgForm } from '@angular/forms';
import { FileuploadService } from '../services/fileupload.service';
import { UserService } from '../services/user.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { UserEntity } from '../entity/user.entity';

@Component({
  selector: 'app-subpic',
  templateUrl: './subpic.component.html',
  styleUrls: ['./subpic.component.scss']
})
export class SubpicComponent implements OnInit {

  constructor(
    private fileUploadService: FileuploadService,
    private userService: UserService,
    public snackBar: MatSnackBar
  ) { }

  @Output() navToTabIndex = new EventEmitter<number>();
  fileToUpload: File = null;
  firstFormGroup: FormGroup;
  fileUploaded = false;

  ngOnInit() {
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  updateFilesList() {
    if (this.userService.getCachedUser('idtoken') != null) {
      const user: UserEntity = this.userService.getCachedUser('user');
      const folder = this.fileUploadService.uploadBaseFolder + user.id;
      this.fileUploadService.listFiles(folder).subscribe(data => {
        this.fileUploadService.imageListCache = data;
      }, error => {
        console.log(error);
      });
    }
  }

  onSubmit(form: NgForm) {
    const user: UserEntity = this.userService.getCachedUser('user');
    const fileName = this.fileUploadService.uploadBaseFolder + user.id + '/' + this.fileToUpload.name;
    this.fileUploadService.postFile(this.fileToUpload, fileName).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          console.log(`File is ${percentDone}% loaded.`);
        } else if (event instanceof HttpResponse) {
          console.log('File is completely loaded!');
          this.updateFilesList();
        }
      },
      (err) => {
        console.log('Upload Error:', err);
        this.snackBar.open(err.error.message, undefined, {
          duration: 2000,
        });
      }, () => {
        this.snackBar.open('Image uploaded', undefined, {
          duration: 2000,
        });
        this.navToTabIndex.emit(1);
      }
    );
  }
}
