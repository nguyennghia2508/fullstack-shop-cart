import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux'
import { useState,useEffect } from "react"
import AdminLayout from "../../../components/layout/admin/AdminLayout";
import adminApi from "../../../api/admin/adminApi";
import FormattedDateTime from '../../../functions/FormattedDateTime'
import PaginationAdmin from '../../../components/admin/PaginationAdmin'
import Loading from "../../../components/common/Loading";
import { toast } from "react-toastify";
import ModalExport from "../../../components/admin/transaction/ModalExport";
import "./styles.scss"

const TransactionAdmin = () => {

    const [currentPage, setCurrentPage] = useState(1); // Giả sử giá trị ban đầu là 1
    const [infoTransaction, setInfoTransaction] = useState([]);
    const [nextPage, setNextPage] = useState(1); // Giả sử giá trị ban đầu là 1
    const [pageTotal, setPageTotal] = useState(1); // Giả sử giá trị ban đầu là 1
    const [prevPage, setPrevPage] = useState(1); // Giả sử giá trị ban đầu là 1
    const [totalPages, setTotalPages] = useState([1]);
    const [page, setPage] = useState(1)
    const [title, setTitle] = useState(null)
    const [currPage, setCurrPage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [deleteItem, setDeleteItem] = useState(false)

    useEffect(() => {
        const getListTransaction= async () => {
            try {
                const data = await adminApi.getListTransaction({page:deleteItem ? 1 : page})
                setDeleteItem(false)
                setTitle(data.title)
                setCurrPage(data.currPage)
                setInfoTransaction(data.result)
                setPageTotal(data.pageTotal)
                setPrevPage(data.prevPage)
                setTotalPages(data.totalPages)
                setNextPage(data.nextPage)
                setCurrentPage(data.currentpage)
            } catch (err) {
                console.log(err)
            }
        }
        getListTransaction();
    }, [deleteItem]);


    const handleSwitchPage = async ({e,page}) =>{
        try {
            const data = await adminApi.getListTransaction({page:page})
            setInfoTransaction(data.result)
            setPageTotal(data.pageTotal)
            setPrevPage(data.prevPage)
            setTotalPages(data.totalPages)
            setNextPage(data.nextPage)
            setCurrentPage(data.currentpage)
            setPage(page)
        }
        catch (err) {
        console.log(err)
        }
    }

    const handleDelete = async (id) =>{
        try {
            setLoading(true)
            const res = await adminApi.deleteTransaction(id)
            if (res.state === 'success') {
                setLoading(false)
                toast.success(res.message, {
                    position: 'top-left',
                    autoClose: 3000,
                    style: { color: '$color-default', backgroundColor: '#fff' },
                });
                setDeleteItem(true)
                if(infoTransaction.length - 1 === 0)
                {
                    setPage(page - 1)
                }
            }
        } catch (err) {
            const errors = err.data.msg
            toast.error(errors, {
                position: 'top-left',
                autoClose: 3000,
                style: { color: '$color-default', backgroundColor: '#fff' },
            });
        }
    }

    return (
        <AdminLayout 
        title={title}
        currPage={currPage}
        add={
            <div className="admin-content-layout">
                <div className="admin-content-header">
                    <span className="admin-content-header-search">
                        <form className="search" method="GET">
                            <input type="text" className="admin-content-header-search-input" placeholder="Search product"/>
                            <svg className="admin-content-header-icon-search" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="14" height="14">
                                <path d="M23.707,22.293l-5.969-5.969a10.016,10.016,0,1,0-1.414,1.414l5.969,5.969a1,1,0,0,0,1.414-1.414ZM10,18a8,8,0,1,1,8-8A8.009,8.009,0,0,1,10,18Z"/>
                            </svg>
                        </form>
                    </span>
                    <div className="col-sm-4">
                        <Link to="/admin/add-transaction">
                            <button type="button" className="btn btn-info add-new"><i className="fa fa-plus"></i> Add New</button>
                        </Link>
                        <ModalExport/>
                    </div>
                    
                </div>
                <div className="admin-content-table">
                    <div className="admin-content-table-content">
                        {!loading ?
                        <div className="table-responsive">
                            <table className="table-admin">
                                <thead className="table-thead-admin">
                                    <tr>
                                        <th className="table-thead-admin-id">No.</th>
                                        <th className="table-thead-admin-user">Transaction</th>
                                        <th className="table-thead-admin-action" style={{textAlign: "center"}}>Actions</th>
                                    </tr>
                                </thead>
                                {infoTransaction && infoTransaction.length !== 0 
                                ? 
                                infoTransaction.map((item,index) => (
                                    <tbody className="table-tbody" key={index}>
                                        <tr>
                                            <td className="table-tbody-td-id">{(currentPage - 1) * 10 + index + 1}</td>                                            
                                            <td className="table-tbody-td-info">
                                                <div className="table-tbody-td-name-email" id="table-tbody-td-type-ske">
                                                    <span className="table-tbody-td-name" id="table-tbody-td-type-name">{item.listProduct}</span>
                                                </div>
                                            </td>
                                            <td className="action">
                                                {/* <Link to={`/admin/detail-transaction/${item._id}`}  className="table-tbody-td-action">
                                                    <span>Detail</span>
                                                </Link>
                                                <Link to={`/admin/edit-transaction/${item._id}`} style={{marginLeft:'10px'}} className="table-tbody-td-action">
                                                    <span>Edit</span>
                                                </Link> */}
                                                <button to="" style={{marginLeft:'10px'}} 
                                                className="table-tbody-td-action" 
                                                onClick={() => handleDelete(item._id)}>
                                                    <span>Delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                ))
                                : null
                                }
                            </table>
                        </div>
                        :
                        <>
                        <div className="table-responsive">
                            <table className="table-admin">
                                <thead className="table-thead-admin">
                                    <tr>
                                        <th className="table-thead-admin-id">ID</th>
                                        <th className="table-thead-admin-user">Transaction</th>
                                        <th className="table-thead-admin-number">Number</th>
                                        <th className="table-thead-admin-price">Price</th>
                                        <th className="table-thead-admin-phone">Categories</th>
                                        <th className="table-thead-admin-joindate">Date of manufacture</th>
                                        <th className="table-thead-admin-action" style={{textAlign: "center"}}>Actions</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <Loading/>
                        </>
                    }
                    </div>
                    <div className="admin-content-page">
                        <div className="admin-content-page-row">
                            <div className="admin-content-page-column-4"></div>
                            <div className="admin-content-page-column-8">
                                <div className="admin-content-makeup">
                                    <ul className="admin-content-makeup-list">
                                        <PaginationAdmin
                                            onclick = {handleSwitchPage}
                                            currentpage = {currentPage}
                                            prevP = {1}
                                            prevPage = {prevPage} 
                                            totalPages = {totalPages}
                                            nextP = {pageTotal ? pageTotal : 1}
                                            nextPage = {nextPage}
                                        />
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>  
        }
        />
    )
};

export default TransactionAdmin;