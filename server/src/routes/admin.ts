import dotenv from 'dotenv';
import express, { Request, Response, NextFunction,Router } from 'express';
import getTime from "../public/js/getTime"
import { validationResult } from 'express-validator';
import addValidator from '../middleware/validate/addValidator';
import updateValidator from '../middleware/validate/updateValidator';
import addTypeValidator from '../middleware/validate/addTypeValidator';
import updateTypeValidator from '../middleware/validate/updateTypeValidator';
import addTransactionValidator from '../middleware/validate/addTransactionValidator';
import multer, { FileFilterCallback } from 'multer';
import { storage, destroyCloudinary, renameCloudinary } from '../storage/storage';
import fs from 'fs';
import path from 'path';
import Rating from '../models/Rating';
import Product from '../models/Product';
import User from '../models/User';
import { ObjectId } from 'mongodb';
import Categories from '../models/Categories';
import Transactions from '../models/Transactions';

dotenv.config();

const router = Router();

declare module 'express' {
    interface Request {
      fileTypeInvalid?: string;
    }
}

const checkFileType = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
    cb(null, true);
  } else {
    const fileTypeInvalid = 'Invalid format, only JPG and PNG';
    cb(new Error(fileTypeInvalid))
  }
};

const uploader = multer({
  storage: storage,
  fileFilter: checkFileType,
});


// router.get('/', (req: Request, res: Response, next: NextFunction) => {
   
// });

router.get('/list-product/:page', (req: Request, res: Response, next: NextFunction) => {
  const perPage = 10;
  const page : number = req.params.page ? parseInt(req.params.page) : 1

  Product.find({})
    .sort({ date: -1 })
    .limit(perPage)
    .skip(perPage * (page - 1))
    .then(function (result) {
      if(result.length)
      {
        Product.count({}).exec().then((count) => {
          if (count) {
            let totalPages: any[] = [];
            const pageTotal: number = Math.ceil(count / perPage);
            const currentpage: number = page;
            const prevPage: number = currentpage <= 1 ? 1 : currentpage - 1;
            const nextPage: number = currentpage >= pageTotal ? pageTotal : currentpage + 1;
            let prevP: number = 1;
            let nextP: number = pageTotal;

            if (pageTotal <= 6) {
              for (let i = 1; i <= pageTotal; i++) {
                  totalPages.push(i);
              }
            } 
            else 
            {
              totalPages.push(1);

              if (currentpage > 3) {
                  totalPages.push('...');
              }

              if (currentpage == pageTotal) {
                  totalPages.push(currentpage - 2);
              }

              if (currentpage > 2) {
                  totalPages.push(currentpage - 1);
              }

              if (currentpage != 1 && currentpage != pageTotal) {
                  totalPages.push(currentpage);
              }

              if (currentpage < pageTotal - 1) {
                  totalPages.push(currentpage + 1);
              }

              if (currentpage == 1) {
                  totalPages.push(currentpage + 2);
              }

              if (currentpage < pageTotal - 2) {
                  totalPages.push('...');
              }
              totalPages.push(pageTotal);
            }

            return res.status(200).json({
              title: 'Manage • ',
              currPage: 'List Product',
              result,
              currentpage,
              totalPages,
              prevPage,
              nextPage,
              prevP,
              nextP,
              pageTotal,
              page,
            });
          }
        })
      }
      else {
        return res.status(200).json({
          title: 'Manage • ',
          currPage: 'List Product',
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get('/list-user/:page', (req: Request, res: Response, next: NextFunction) => {
    const perPage: number = 10;
    const page : number = req.params.page ? parseInt(req.params.page) : 1

    User.find({})
        .sort({ date: 1 })
        .limit(perPage)
        .skip(perPage * (page - 1))
        .then(function (result) {
          if(result.length)
          {
            User.count({}).exec().then((count) => {
                if (count) {
                  let totalPages: any[] = [];
                  const pageTotal: number = Math.ceil(count / perPage);
                  const currentpage: number = page;
                  const prevPage: number = currentpage <= 1 ? 1 : currentpage - 1;
                  const nextPage: number = currentpage >= pageTotal ? pageTotal : currentpage + 1;
                  let prevP: number = 1;
                  let nextP: number = pageTotal;
      
                  if (pageTotal <= 6) {
                    for (let i = 1; i <= pageTotal; i++) {
                        totalPages.push(i);
                    }
                  } 
                  else 
                  {
                  totalPages.push(1);
    
                  if (currentpage > 3) {
                      totalPages.push('...');
                  }
    
                  if (currentpage == pageTotal) {
                      totalPages.push(currentpage - 2);
                  }
    
                  if (currentpage > 2) {
                      totalPages.push(currentpage - 1);
                  }
    
                  if (currentpage != 1 && currentpage != pageTotal) {
                      totalPages.push(currentpage);
                  }
    
                  if (currentpage < pageTotal - 1) {
                      totalPages.push(currentpage + 1);
                  }
    
                  if (currentpage == 1) {
                      totalPages.push(currentpage + 2);
                  }
    
                  if (currentpage < pageTotal - 2) {
                      totalPages.push('...');
                  }
                  totalPages.push(pageTotal);
                }
                return res.status(200).json({
                    title: 'Manage • ',
                    currPage: 'List User',
                    result,
                    currentpage,
                    totalPages,
                    prevPage,
                    nextPage,
                    prevP,
                    nextP,
                    pageTotal,
                });
              }
            })
          }
          else {
            return res.status(200).json({
                title: 'Manage • ',
                currPage: 'List User',
            });
          }
        })
    .catch((error) => {
        console.log(error);
    });
});  
 
router.get('/add-product', async (req: Request, res: Response, next: NextFunction) => {
  const listType = await Categories.find({})
  return res.status(200).json({
      title: 'Manage • ',
      currPage: 'Add Product',
      listType:listType
    });
});
  
router.post('/add-product', uploader.fields([{ name: 'myImage' }]), addValidator, (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
    let message: string = '';
  
    if (result.isEmpty()) {
      const body = req.body;
      if (req.files && 'myImage' in req.files) {
        const myImage = req.files['myImage'][0];
        
        const product = new Product({
          productID: body.productID,
          name: body.name,
          number: body.number,
          price: body.price,
          date: body.dom,
          category: body.type,
          desc: body.desc,
          detail: body.detail,
          image: {
            path: myImage.path,
            name: myImage.originalname,
            imageType: myImage.mimetype,
          },
          totalSold: 0,
        });

        product.save().then((p) => {
          const newRating = new Rating({
            productId: p._id,
            productName: p.name,
          });

          newRating.save();
          return res.status(200).json({
            param: 'admin',
            state: 'success',
            message: 'Add product success'
          })
        }).catch((err) => {
          console.log(err);
        });
      }
    } 
    else {
      const errors = result.array();
      message = errors[0].msg;
      return res.status(401).json({
        param: 'admin',
        state: 'false',
        msg: message
      })
    }
},
function (err:Error, req: Request, res: Response, next: NextFunction) {
  // handle your error here
  if (err) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      param: 'admin',
      state: 'false',
      msg: err.message
    });
  }
});
  
router.get('/detail-product/:id', (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid product ID' });
  }

  Product.findById(id)
    .then((u) => {
      if (!u) {
        // Handle the case where the product with the specified id is not found
        return res.status(404).json({
          msg:'Product not found'
        });
      }

      const result = [
        {
          productID: u.productID,
          id: u._id,
          name: u.name,
          number: u.number,
          price: u.price,
          type: u.category,
          detail: u.detail,
          date: u.date,
          desc: u.desc,
          image: u.image,
        },
      ];

      return res.status(200).json({
        result,
        title: 'Manage • ',
        currPage: 'Detail Product',
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
});

router.post('/delete-product/:id', (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid product ID' });
  }

  if (id) {
    Product.findById(id)
      .then((u) => {
        if (!u) {
          return res.status(404).json({
            msg:'Product not found'
          });
        }

        Product.deleteOne({ _id: u.id })
          .then(() => {
            destroyCloudinary(u.name)
            return res.status(200).json({
              param: 'admin',
              state: 'success',
              message: 'Delete product success'
            })
          })
          .catch((error) => {
            return res.status(401).json({
              param: 'admin',
              state: 'false',
              msg: `Delete product failed ${error}`
            })
          });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send('Internal Server Error');
      });
  }
});

router.get('/edit-product/:id', (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid product ID' });
  }

  Product.findById(id)
    .then(async (u) => {
      if (!u) {
        // Handle the case where the product with the specified id is not found
        return res.status(404).json({
          msg:'Product not found'
        });
      }
      const listType = await Categories.find({})
      const result = [
        {
          productID:u.productID,
          id: u._id,
          name: u.name,
          number: u.number,
          price: u.price,
          type: u.category,
          detail: u.detail,
          date: u.date,
          desc: u.desc,
          image: u.image,
        },
      ];

      return res.status(200).json({
        result,
        title: 'Manage • ',
        currPage: 'Edit Product',
        listType:listType
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
});


router.post('/edit-product/:id', uploader.fields([{ name: 'myImageEdit' }]), updateValidator, (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = validationResult(req);
  let message: string = '';

  if (req.fileTypeInvalid) {
    const message = req.fileTypeInvalid;
    return res.status(401).json({
      param: 'admin',
      state: 'false',
      msg: message
    })
  }

  if (result.isEmpty()) {
    const body = req.body;
    if (req.files && 'myImageEdit' in req.files)
    {
      const myImageEdit = req.files['myImageEdit'];
      const product = {
        productID: body.productID,
        name: body.name,
        number: body.number,
        price: body.price,
        date: body.dom,
        category: body.type,
        desc: body.desc,
        detail: body.detail,
        image: {
          path: myImageEdit[0].path,
          name: myImageEdit[0].originalname,
          imageType: myImageEdit[0].mimetype,
          },
        };

      Product.findById(id)
        .then((p) => {
          if(!p)
          {
            return res.status(404).json({
              msg:'Product not found'
            });
          }
          else
          {
            if (body.name === p.name) {
              Product.findOneAndUpdate({ _id: id }, product)
                .then(() => {
                  return res.status(200).json({
                    param: 'admin',
                    state: 'success',
                    message: 'Edit product success'
                  })
                })
                .catch((error) => {
                  console.log(error);
                });
            } else {
              Product.findOneAndUpdate({ _id: id }, product)
                .then(() => {
                  // renameCloudinary(p.name, body.name);
                  destroyCloudinary(p.name);
                  return res.status(200).json({
                    param: 'admin',
                    state: 'success',
                    message: 'Edit product success'
                  })
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          }
        })
        .catch((error) => {
          console.log(error);
      });
    } 
    else {
      Product.findById(id)
        .then((p) => {
          if(!p)
          {
            return res.status(404).json({
              msg:'Product not found'
            });
          }
          else
          {
            const product = {
              _id: id,
              productID: body.productID,
              name: body.name,
              number: body.number,
              price: body.price,
              date: body.dom,
              category: body.type,
              desc: body.desc,
              detail: body.detail,
              image: {
                path: p.image.path,
                name: p.image.name,
                imageType: p.image.imageType,
              },
            };
  
            if (body.name === p.name || body.productID === p.productID) {
              Product.findOneAndUpdate({ _id: id }, product)
                .then(() => {
                  return res.status(200).json({
                    param: 'admin',
                    state: 'success',
                    message: 'Edit product success'
                  })
                })
                .catch((error) => {
                  console.log(error);
                });
            } else {
              Product.findOneAndUpdate({ _id: id }, product)
                .then(() => {
                  renameCloudinary(p.name, body.name);
                  return res.status(200).json({
                    param: 'admin',
                    state: 'success',
                    message: 'Edit product success'
                  })
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  } else {
    const errors = result.array();
    message = errors[0].msg;
    return res.status(401).json({
      param: 'admin',
      state: 'false',
      msg: message
    })
  }
},
function (err:Error, req: Request, res: Response, next: NextFunction) {
  // handle your error here
  if (err) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      param: 'admin',
      state: 'false',
      msg: err.message
    });
  }
})

router.get('/add-type', (req: Request, res: Response, next: NextFunction) => {

  return res.status(200).json({
      title: 'Manage • ',
      currPage: 'Add Type',
    });
});

router.post('/add-type', addTypeValidator, (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
    let message: string = '';
    const body = req.body;
    if (result.isEmpty()) {
      
      const type = new Categories({
        typeProduct:body.type
      });

      type.save().then((p) => {
        return res.status(200).json({
          param: 'admin',
          state: 'success',
          message: 'Add product type success'
        })
      }).catch((err) => {
        console.log(err);
      });

    } else {
      const errors = result.array();
      message = errors[0].msg;
      return res.status(401).json({
        param: 'admin',
        state: 'false',
        msg: message
      })
    }
});

router.get('/list-type/:page', (req: Request, res: Response, next: NextFunction) => {
  const perPage: number = 10;
  const page : number = req.params.page ? parseInt(req.params.page) : 1

  Categories.find({})
      .limit(perPage)
      .skip(perPage * (page - 1))
      .then(function (result) {
        if(result.length)
        {
          Categories.count({}).exec().then((count) => {
              if (count) {
                let totalPages: any[] = [];
                const pageTotal: number = Math.ceil(count / perPage);
                const currentpage: number = page;
                const prevPage: number = currentpage <= 1 ? 1 : currentpage - 1;
                const nextPage: number = currentpage >= pageTotal ? pageTotal : currentpage + 1;
                let prevP: number = 1;
                let nextP: number = pageTotal;
    
                if (pageTotal <= 6) {
                  for (let i = 1; i <= pageTotal; i++) {
                      totalPages.push(i);
                  }
                } 
                else 
                {
                totalPages.push(1);
  
                if (currentpage > 3) {
                    totalPages.push('...');
                }
  
                if (currentpage == pageTotal) {
                    totalPages.push(currentpage - 2);
                }
  
                if (currentpage > 2) {
                    totalPages.push(currentpage - 1);
                }
  
                if (currentpage != 1 && currentpage != pageTotal) {
                    totalPages.push(currentpage);
                }
  
                if (currentpage < pageTotal - 1) {
                    totalPages.push(currentpage + 1);
                }
  
                if (currentpage == 1) {
                    totalPages.push(currentpage + 2);
                }
  
                if (currentpage < pageTotal - 2) {
                    totalPages.push('...');
                }
                totalPages.push(pageTotal);
              }
              return res.status(200).json({
                  title: 'Manage • ',
                  currPage: 'List Type',
                  result,
                  currentpage,
                  totalPages,
                  prevPage,
                  nextPage,
                  prevP,
                  nextP,
                  pageTotal,
              });
            }
          })
        }
        else {
          return res.status(200).json({
              title: 'Manage • ',
              currPage: 'List Type',
          });
        }
      })
  .catch((error) => {
      console.log(error);
  });
});  

router.get('/edit-type/:id', (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid Product type ID' });
  }

  Categories.findById(id)
    .then(async (u) => {
      if (!u) {
        // Handle the case where the product with the specified id is not found
        return res.status(404).json({
          msg:'Product type not found'
        });
      }

      return res.status(200).json({
        title: 'Manage • ',
        currPage: 'Edit Type',
        typeProduct:u.typeProduct
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
});

router.post('/edit-type/:id', updateTypeValidator, (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = validationResult(req);
  let message: string = '';
  const body = req.body;
  if (result.isEmpty()) 
  {
    const typeProduct = body.type

    Categories.findById(id)
      .then((p) => {
        if(!p)
        {
          return res.status(404).json({
            msg:'Product type not found'
          });
        }
        else
        {
          if (typeProduct === p.typeProduct) {
            Categories.findOneAndUpdate({ _id: id }, {typeProduct:typeProduct})
              .then(() => {
                return res.status(200).json({
                  param: 'admin',
                  state: 'success',
                  message: 'Edit Product type success'
                })
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            Categories.findOneAndUpdate({ _id: id }, {typeProduct:typeProduct})
              .then(() => {
                return res.status(200).json({
                  param: 'admin',
                  state: 'success',
                  message: 'Edit Product type success'
                })
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }
      })
      .catch((error) => {
        console.log(error);
    });

  } else {
    const errors = result.array();
    message = errors[0].msg;
    return res.status(401).json({
      param: 'admin',
      state: 'false',
      msg: message
    })
  }
});

router.post('/delete-type/:id', (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid Product type ID' });
  }

  if (id) {
    Categories.findById(id)
      .then((u) => {
        if (!u) {
          return res.status(404).json({
            msg:'Product type not found'
          });
        }

        Categories.deleteOne({ _id: u.id })
          .then(() => {
            return res.status(200).json({
              param: 'admin',
              state: 'success',
              message: 'Delete Product type success'
            })
          })
          .catch((error) => {
            return res.status(401).json({
              param: 'admin',
              state: 'false',
              msg: `Delete Product type failed ${error}`
            })
          });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send('Internal Server Error');
      });
  }
});

router.get('/list-transaction/:page', (req: Request, res: Response, next: NextFunction) => {
  const perPage: number = 10;
  const page : number = req.params.page ? parseInt(req.params.page) : 1

  Transactions.find({})
      .limit(perPage)
      .skip(perPage * (page - 1))
      .then(function (result) {
        if(result.length)
        {
          Transactions.count({}).exec().then((count) => {
              if (count) {
                let totalPages: any[] = [];
                const pageTotal: number = Math.ceil(count / perPage);
                const currentpage: number = page;
                const prevPage: number = currentpage <= 1 ? 1 : currentpage - 1;
                const nextPage: number = currentpage >= pageTotal ? pageTotal : currentpage + 1;
                let prevP: number = 1;
                let nextP: number = pageTotal;
    
                if (pageTotal <= 6) {
                  for (let i = 1; i <= pageTotal; i++) {
                      totalPages.push(i);
                  }
                } 
                else 
                {
                totalPages.push(1);
  
                if (currentpage > 3) {
                    totalPages.push('...');
                }
  
                if (currentpage == pageTotal) {
                    totalPages.push(currentpage - 2);
                }
  
                if (currentpage > 2) {
                    totalPages.push(currentpage - 1);
                }
  
                if (currentpage != 1 && currentpage != pageTotal) {
                    totalPages.push(currentpage);
                }
  
                if (currentpage < pageTotal - 1) {
                    totalPages.push(currentpage + 1);
                }
  
                if (currentpage == 1) {
                    totalPages.push(currentpage + 2);
                }
  
                if (currentpage < pageTotal - 2) {
                    totalPages.push('...');
                }
                totalPages.push(pageTotal);
              }
              return res.status(200).json({
                  title: 'Manage • ',
                  currPage: 'List Transaction',
                  result,
                  currentpage,
                  totalPages,
                  prevPage,
                  nextPage,
                  prevP,
                  nextP,
                  pageTotal,
              });
            }
          })
        }
        else {
          return res.status(200).json({
              title: 'Manage • ',
              currPage: 'List Transaction',
          });
        }
      })
  .catch((error) => {
      console.log(error);
  });
});  

router.get('/add-transaction', async (req: Request, res: Response, next: NextFunction) => {
  const listProduct = await Product.find({})
  return res.status(200).json({
      title: 'Manage • ',
      currPage: 'Add Transaction',
      listProduct:listProduct.map(item => [item.productID,item.name])
    });
});

router.post('/add-transaction', addTransactionValidator, (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  let message: string = '';
  const body = req.body;
  if (result.isEmpty()) {
    const transaction = new Transactions({
      listProduct: body.transaction.sort((a: string,b: string) => a.localeCompare(b)).join(', ')
    });

    transaction.save().then((p) => {
      return res.status(200).json({
        param: 'admin',
        state: 'success',
        message: 'Add transaction success'
      })
    }).catch((err) => {
      console.log(err);
    });

  } else {
    const errors = result.array();
    message = errors[0].msg;
    return res.status(401).json({
      param: 'admin',
      state: 'false',
      msg: message
    })
  }
});

router.post('/delete-transaction/:id', (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid Transaction ID' });
  }

  if (id) {
    Transactions.findById(id)
      .then((u) => {
        if (!u) {
          return res.status(404).json({
            msg:'Transaction not found'
          });
        }

        Transactions.deleteOne({ _id: u.id })
          .then(() => {
            return res.status(200).json({
              param: 'admin',
              state: 'success',
              message: 'Delete Transaction success'
            })
          })
          .catch((error) => {
            return res.status(401).json({
              param: 'admin',
              state: 'false',
              msg: `Delete Transaction failed ${error}`
            })
          });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send('Internal Server Error');
      });
  }
});

router.post('/export-transaction', async (req, res, next) => {

  const dataToExport = (await Transactions.find({})).map(item => item.listProduct)
  if(dataToExport.length > 0)
  {
    res.status(200).json({
      state:"success",
      data:dataToExport.map(item => item.trim().replace(/,/g, ' '))
    });
  }
});

module.exports = router