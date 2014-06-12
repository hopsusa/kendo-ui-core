<%@ Page Title="" Language="C#" MasterPageFile="~/Areas/aspx/Views/Shared/Web.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div id="example" class="k-content">

        <div id="colors">
            <label for="input">Primary color</label>
            <%= Html.Kendo().AutoComplete()
                    .Name("input")
                    .BindTo(new string[] 
                    {
                    "Red-violet",
                    "Red",
                    "Red-orange",
                    "Orange",
                    "Yellow-orange",
                    "Yellow",
                    "Yellow-green",
                    "Green",
                    "Blue-green",
                    "Blue",
                    "Blue-violet",
                    "Violet"
                    })
            %>
        </div>

        <div class="box">
            <div class="box-col">
                <h4>Set / Get Value</h4>
                <ul class="options">
                    <li>
                        <input id="Text1" type="text" class="k-textbox" />
                        <button id="Button1" class="k-button">Set value</button>
                    </li>
                    <li style="text-align: right;">
                        <button id="Button2" class="k-button">Get value</button>
                    </li>
                </ul>
            </div>
            <div class="box-col">
                <h4>Find item</h4>
                <ul class="options">
                    <li>
                        <input id="Text2" value="B" class="k-textbox" />
                        <button id="Button3" class="k-button">Search</button>
                    </li>
                </ul>
            </div>
        </div>

        <script>
            $(document).ready(function() {
                var autocomplete = $("#input").data("kendoAutoComplete"),
                    setValue = function(e) {
                        if (e.type != "keypress" || kendo.keys.ENTER == e.keyCode)
                            autocomplete.value($("#value").val());
                    },
                    setSearch = function(e) {
                        if (e.type != "keypress" || kendo.keys.ENTER == e.keyCode)
                            autocomplete.search($("#word").val());
                    };

                $("#set").click(setValue);
                $("#value").keypress(setValue);
                $("#search").click(setSearch);
                $("#word").keypress(setSearch);

                $("#get").click(function() {
                    alert(autocomplete.value());
                });
            });
        </script>
            <style scoped>
                #colors {
                    width: 366px;
                    height: 180px;
                    padding: 114px 0 0 0;
                    background: url('/content/web/autocomplete/palette.png') transparent no-repeat right 0;
                    margin: 30px auto;
                    text-align: center;
 				}
                #colors label {
                    display: block;
                    color: #333;
                    padding-bottom: 5px;
 				}
                #input {
                    margin-right: 50px;
                }
                .box .k-textbox {
                    width: 80px;
                }
                .box .k-button {
                    min-width: 80px;
                }
            </style>
    </div>
</asp:Content>