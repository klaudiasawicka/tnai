using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjektTnai.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    nazwa_roli = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Wyposażenie",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    nazwa = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wyposażenie", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Zasoby",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    nazwa = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    typ = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    piętro = table.Column<int>(type: "int", nullable: false),
                    pojemność = table.Column<int>(type: "int", nullable: false),
                    cena_za_godzinę = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    url_zdjęcia = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Zasoby", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Użytkownicy",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    hasło = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    imię_nazwisko = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    inicjały = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    data_rejestracji = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    rola_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Użytkownicy", x => x.id);
                    table.ForeignKey(
                        name: "FK_Użytkownicy_Roles_rola_id",
                        column: x => x.rola_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Zasób_Wyposażenie",
                columns: table => new
                {
                    zasób_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    wyposażenie_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Zasób_Wyposażenie", x => new { x.zasób_id, x.wyposażenie_id });
                    table.ForeignKey(
                        name: "FK_Zasób_Wyposażenie_Wyposażenie_wyposażenie_id",
                        column: x => x.wyposażenie_id,
                        principalTable: "Wyposażenie",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Zasób_Wyposażenie_Zasoby_zasób_id",
                        column: x => x.zasób_id,
                        principalTable: "Zasoby",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rezerwacje",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    użytkownik_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    zasób_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    czas_rozpoczęcia = table.Column<DateTime>(type: "datetime2", nullable: false),
                    czas_zakończenia = table.Column<DateTime>(type: "datetime2", nullable: false),
                    łączna_cena = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    liczba_uczestników = table.Column<int>(type: "int", nullable: false),
                    notatka = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    data_utworzenia = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rezerwacje", x => x.id);
                    table.ForeignKey(
                        name: "FK_Rezerwacje_Użytkownicy_użytkownik_id",
                        column: x => x.użytkownik_id,
                        principalTable: "Użytkownicy",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Rezerwacje_Zasoby_zasób_id",
                        column: x => x.zasób_id,
                        principalTable: "Zasoby",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Rezerwacje_użytkownik_id",
                table: "Rezerwacje",
                column: "użytkownik_id");

            migrationBuilder.CreateIndex(
                name: "IX_Rezerwacje_zasób_id",
                table: "Rezerwacje",
                column: "zasób_id");

            migrationBuilder.CreateIndex(
                name: "IX_Użytkownicy_rola_id",
                table: "Użytkownicy",
                column: "rola_id");

            migrationBuilder.CreateIndex(
                name: "IX_Zasób_Wyposażenie_wyposażenie_id",
                table: "Zasób_Wyposażenie",
                column: "wyposażenie_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Rezerwacje");

            migrationBuilder.DropTable(
                name: "Zasób_Wyposażenie");

            migrationBuilder.DropTable(
                name: "Użytkownicy");

            migrationBuilder.DropTable(
                name: "Wyposażenie");

            migrationBuilder.DropTable(
                name: "Zasoby");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
